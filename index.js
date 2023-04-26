import mysql from "mysql2";
import inquirer from "inquirer";
import "console.table";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Rootr00t!",
  database: "employee_db",
});

const questions = [
  {
    type: "list",
    message: "What would you like to do?:",
    name: "start",
    choices: [
      "View all departments",
      "View all employees",
      "View all roles",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role",
    ],
  },
];

// Questions for adding a new employee
const questionsEmployee = [
  {
    type: "input",
    message: "Enter first name:",
    name: "first",
  },
  {
    type: "input",
    message: "Enter last name:",
    name: "last",
  },
];
// Questions for adding a new department
const questionsDepartment = [
  {
    type: "input",
    message: "Enter new department name:",
    name: "department",
  },
];

inquire();

function inquire() {
  inquirer.prompt(questions).then((answers) => {
    switch (answers.start) {
      case "View all departments":
        viewDepartments();
        break;
      case "View all employees":
        viewEmployees();
        break;
      case "View all roles":
        viewRoles();
        break;
      case "Add a department":
        addDepartment();
        break;
      case "Add a role":
        addRoles();
        break;
      case "Add an employee":
        addEmployee();
        break;
      case "Update an employee role":
        updateRole();
        break;
    }
  });
}

// Views department, employees and roles
function viewDepartments() {
  db.query("SELECT * FROM department", function (err, results) {
    console.table(results);
    inquire();
  });
}

function viewEmployees() {
  db.query("Select * FROM employee", function (err, results) {
    console.table(results);
    inquire();
  });
}

function viewRoles() {
  db.query("Select * FROM roles", function (err, results) {
    console.table(results);
    inquire();
  });
}

// Adding departments
function addDepartment() {
  inquirer.prompt(questionsDepartment).then((answer) => {
    let departmentName = {
      department_name: answer.department,
    };
    db.promise()
      .query("INSERT INTO department SET ?", departmentName)
      .then(() => {
        console.log("successfully added department");
        inquire();
      });
  });
}

// Adding roles
function addRoles() {
  db.query("SELECT * FROM department", function (err, res) {
    if (err) {
      console.log(err);
      return inquire();
    }
    const deptChoices = res.map((department) => ({
      name: department.department_name,
      value: department.id,
    }));
    inquirer
      .prompt([
        {
          type: "input",
          message: "Input new role name:",
          name: "role",
        },
        {
          type: "input",
          message: "Input a salary:",
          name: "salary",
        },
        {
          type: "list",
          message: "Choose a department:",
          name: "departmentChoice",
          choices: deptChoices,
        },
      ])

      .then((answer) => {
        let roleName = {
          title: answer.role,
          salary: answer.salary,
          department_id: answer.departmentChoice,
        };

        db.promise()
          .query("INSERT INTO roles SET ?", roleName)
          .then(() => {
            console.log("successfully added role");
            inquire();
          });
      });
  });
}

function addEmployee() {
  inquirer
    .prompt(questionsEmployee)

    .then((answers) => {
      let firstName = answers.first;
      let lastName = answers.last;

      db.promise()
        .query("SELECT * FROM roles")
        .then((response) => {
          let roleChoices = response[0].map(({ id, title }) => ({
            name: title,
            value: id,
          }));

          inquirer
            .prompt({
              type: "list",
              message: "What is the employees role?",
              name: "roleid",
              choices: roleChoices,
            })

            .then((response) => {
              let roleid = response.roleid;
              db.promise()
                .query("SELECT * FROM employee")
                .then((response) => {
                  let managerChoices = response[0].map(
                    ({ id, first_name, last_name }) => ({
                      name: `${first_name} ${last_name}`,
                      value: id,
                    })
                  );

                  managerChoices.unshift({ name: "none", value: null });
                  inquirer
                    .prompt({
                      type: "list",
                      message: "What is employees manager?",
                      name: "managerid",
                      choices: managerChoices,
                    })

                    .then((response) => {
                      let employee = {
                        first_name: firstName,
                        last_name: lastName,
                        role_id: roleid,
                        manager_id: response.managerid,
                      };

                      db.promise()
                        .query("INSERT INTO employee SET ?", employee)
                        .then(() => {
                          console.log("successfully added employee");
                        })
                        .then(() => {
                          inquire();
                        });
                    });
                });
            });
        });
    });
}

function updateRole() {
  db.query("SELECT * FROM department", function (err, res) {
    if (err) {
      console.log(err);
      return inquire();
    }
    const roleChoices = res.map((role) => ({
      name: role.department_name,
      value: role.id,
    }));
    inquirer
      .prompt([
        {
          type: "list",
          message: "Choose a department:",
          name: "roleChoice",
          choices: roleChoices,
        },
        {
          type: "list",
          name: "updateField",
          message: "Select which field to update",
          choices: ["title", "salary"],
        },
        {
          type: "input",
          name: "updateValue",
          message: "Enter a new value",
        },
      ])

      .then((answer) => {
        let roleChoice = answer.roleChoice;
        let updateField = answer.updateField.toLowerCase();
        let updateValue = answer.updateValue.toLowerCase();

        let query;
        switch (updateField) {
          case "title":
            query = `UPDATE roles SET title ="${updateValue}" WHERE id=${roleChoice}`;
            break;
          case "salary":
            query = `UPDATE roles SET salary ="${updateValue}" WHERE id=${roleChoice}`;
            break;
          default:
            console.log("How did this happen");
            return inquire();
        }
        db.query(query, function (err, res) {
          if (err) {
            console.log(err);
          } else {
            console.log(`Role ${updateField} updated to ${updateValue}`);
          }
          inquire();
        });
      });
  });
}
