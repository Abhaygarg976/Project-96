-- insert_company_user
CREATE DEFINER=`root`@`localhost` PROCEDURE `insert_company_user`(
    IN `address` VARCHAR(2000),
    IN `email` VARCHAR(1000),
    IN `mobile` VARCHAR(2000),
    IN `password` VARCHAR(200),
    IN `user_name` VARCHAR(1000)  
)
BEGIN
    INSERT INTO college_master (user_name, email, deleted_b) VALUES (user_name, email, 'N');
    SET @college_id = LAST_INSERT_ID(); 

    INSERT INTO user_master (
        email, user_name, mobile, user_id, created_on, deleted_b, password, user_group, Imagepath
    )
    VALUES (
        email, user_name, mobile, @college_id, CURDATE(), 'N', password, 'admin', 'monica.jpg'
    );
END

-- login_user
CREATE DEFINER=`root`@`localhost` PROCEDURE `login_user`(IN `email_param` VARCHAR(1000), IN `password_param` VARCHAR(200))
BEGIN
  DECLARE login_count INT;

  SELECT COUNT(*) INTO login_count
  FROM user_master
  WHERE email = email_param AND password = password_param;

  IF login_count > 0 THEN
    SELECT 1 AS login_status;
  ELSE
    SELECT 0 AS login_status;
  END IF;
END

-- get_user_master_data
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_master_data`()
BEGIN
    SELECT id, user_name, email, mobile FROM user_master;
END

-- get_user_by_id
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_by_id`(
    IN `user_name` INT
)
BEGIN
    SELECT * FROM user_master WHERE id = user_name;
END

-- delete_data
CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_data`(IN main_id INT)
BEGIN
  DELETE FROM user_master WHERE id = main_id;
  DELETE FROM college_master WHERE college_id = main_id;
END

-- update_user_by_id
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_user_by_id`(
  IN `user_id` INT,
  IN `user_name` VARCHAR(1000),
  IN `email` VARCHAR(1000),
  IN `mobile` VARCHAR(2000),
  IN `image_name` VARCHAR(1000)
)
BEGIN
  UPDATE user_master
  SET user_name = user_name, email = email, mobile = mobile, Imagepath = image_name
  WHERE id = user_id;
END

-- user_master_userformdata
CREATE DEFINER=`root`@`localhost` PROCEDURE `user_master_userformdata`(
    IN `uname` VARCHAR(255),
    IN `email` VARCHAR(255),
    IN `mobile` BIGINT,
    IN `password` VARCHAR(255),
    IN `imgpath` VARCHAR(255)
)
BEGIN
    INSERT INTO college_master (user_name, email, deleted_b) VALUES (uname, email, 'N');
    SET @college_id = LAST_INSERT_ID(); 

    INSERT INTO user_master (
        user_name, email, user_id, mobile,created_on, deleted_b, password, user_group, Imagepath
    )
    VALUES (
        uname, email, @college_id, mobile,CURDATE(), 'Y', password, 'admin', imgpath
    );
END