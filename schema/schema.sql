DROP DATABASE IF EXISTS employee_db;
CREATE dATABASE employee_db;

USE employee_db;

CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL

);
CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(8,2) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE SET NULL
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT REFERENCES employee(id),
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE SET NULL
);