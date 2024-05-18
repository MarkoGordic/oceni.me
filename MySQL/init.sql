-- Create a new user 'ftnadmin' with the specified password
CREATE USER 'ftnadmin'@'%' IDENTIFIED BY 'ftnadmin';

-- Grant all privileges on the `ocenime` database to the `ftnadmin` user
GRANT ALL PRIVILEGES ON ocenime.* TO 'ftnadmin'@'%';

-- Flush privileges to ensure that they are reloaded
FLUSH PRIVILEGES;
