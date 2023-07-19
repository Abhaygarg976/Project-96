var express = require('express');
var router = express.Router();
var con = require("../database");
var mysql = require("mysql");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profile");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });


router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.get('/attendanceBrowser', function(req, res, next) {
  res.render('attendanceBrowser', { title: 'Express' });
});

router.get("/attendanceMobile", function (req, res, next) {
  res.render("attendanceMobile", { title: "sumit" });
});

router.post("/login", function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  var loginSql = "CALL login_user(?, ?)";
  con.query(loginSql, [email, password], function (err, result, fields) {
    if (err) {
      console.error('An error occurred while fetching user details:', err);
      return res.status(500).json({ login_status: 0, error: 'An error occurred while fetching user details.' });
    }

    var loginStatus = result[0][0].login_status;
    var user = {
      user_name: result[0][0].user_name,
      Imagepath: result[0][0].Imagepath
    };

    res.json({ login_status: loginStatus, user: user });
  });
});




router.get('/auth_reg', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.post("/auth_reg", function (req, res, next) {
  var email = req.body.email;
  var mobile = req.body.mobile;
  var password = req.body.password;
  var cpassword = req.body.cpassword;
  var user_name = req.body.user_name;

  if (cpassword === password) {
    var insertSql = "CALL insert_company_user (?, ?, ?, ?, ?);";
    con.query(
      insertSql,
      [null, email, mobile, password, user_name], 
      function (err, result) {
        if (err) throw err;

        if (result.affectedRows > 0) {
          res.redirect("/");
        } else {
          res.redirect("/");
        }
      }
    );
  } else {
    res.redirect("/");
  }
});


router.get('/dashboard', function(req, res, next) {
  var procedureSql = "CALL get_user_master_data();";
  con.query(procedureSql, function (err, result, fields) {
    if (err) throw err;
    res.render('dashboard', { title: 'Dashboard', users: result[0] });
  });
});


router.delete('/delete/:id', function (req, res, next) {
  const userId = req.params.id;

  const deleteSql = 'CALL delete_data(?)';
  con.query(deleteSql, [userId], function (err, result) {
    if (err) {
      console.error('An error occurred while deleting the user:', err);
      res.status(500).json({ success: false });
    } else {
      console.log('User deleted successfully.');
      res.status(200).json({ success: true });
    }
  });
});



router.get('/add_user', function(req, res, next) {
  res.render('adduser', { title: 'Express' });
});


router.post("/add_user", upload.single("Imagepath"), function (req, res, next) {
  var user_name = req.body.user_name;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var password = req.body.password;
  var imageName = req.file.filename; 

  var insertSql = "CALL user_master_userformdata (?,?,?,?,?)";

  con.query(insertSql, [user_name, email, mobile, password, imageName], function (err, result, fields) {
    if (err) {
      console.error("An error occurred while adding the user:", err);
      res.redirect("/dashboard");
    } else {
      var imagePath = path.join(__dirname, "../public/profile", imageName);

      sharp(req.file.path)
        .resize(800) 
        .toFile(imagePath, function (err) {
          if (err) {
            console.error("Failed to save profile image:", err);
          }
        });

      if (result.affectedRows > 0) {
        console.log("User added successfully.");
        res.redirect("/dashboard");
      } else {
        res.redirect("/dashboard");
      }
    }
  });
});


router.get('/edit/:id', function(req, res, next) {
  const userId = req.params.id;
  const getUserSql = "CALL get_user_by_id(?);";
  
  con.query(getUserSql, [userId], function (err, result, fields) {
    if (err) {
      console.error('An error occurred while fetching user data:', err);
      res.redirect("/dashboard");
    } else {
      if (result[0].length > 0) {
        res.render('edit', { title: 'Edit User', user: result[0][0] });
      } else {
        res.redirect("/dashboard");
      }
    }
  });
});

router.post("/edit/:id", upload.single("Imagepath"), function (req, res, next) {
  const userId = req.params.id;
  const { user_name, email, mobile } = req.body;

  let imageName = req.file ? req.file.filename : null;

  const updateUserSql = "CALL update_user_by_id(?, ?, ?, ?, ?);";
  con.query(
    updateUserSql,
    [userId, user_name, email, mobile, imageName],
    function (err, result) {
      if (err) {
        console.error("An error occurred while updating user data:", err);
        res.redirect("/dashboard");
      } else {
        console.log("User updated successfully.");

        if (imageName) {
          const imagePath = path.join(__dirname, "../public/profile", imageName);

          sharp(req.file.path)
            .resize(800)
            .toFile(imagePath, function (err) {
              if (err) {
                console.error("Failed to save profile image:", err);
              }
            });
        }

        res.redirect("/dashboard");
      }
    }
  );
});

router.get('/edit', function(req, res, next) {
  res.redirect('/dashboard'); 
});


router.get("/logout", function (req, res, next) {
  if (req.session.email) {
    req.session.destroy();
  }
  res.redirect("/");
});


router.post('/getimg', function (req, res, next) {
  const callProc = "CALL get_images()";
  con.query(callProc, function (err, result) {
    if (err) {
      console.error('Error calling get_images stored procedure:', err);
      res.status(500).json({ error: 'Failed to fetch images from the database.' });
    } else {
      res.json(result[0]);
    }
  });
});


router.post("/storeFaceMatchResult", function (req, res, next) {
  var label = req.body.label;
  var distance = req.body.distance;
  var updateType = req.body.update_type;
  var user_id = label;

  var insertSql = "CALL Attendance(?, ?, ?, ?, ?, ?)";
  con.query(insertSql, [updateType, null, null, user_id, distance, null], function (err, result) {
    if (err) {
      console.error("An error occurred while storing face match result:", err);
      res.status(500).json({ success: false, error: err });
    } else {
      console.log("Face match result stored:", result);
      res.json({ success: true });
    }
  });
});

router.post("/storeCheckoutTime", function (req, res, next) {
  var label = req.body.label;
  var updateType = "out";
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  var range_status = req.body.range_status;

  var selectSql = "SELECT email , user_name FROM user_master WHERE user_name = ?";
  con.query(selectSql, [label], function (err, result) {
    if (err) {
      console.error("An error occurred while retrieving user details:", err);
      res.status(500).json({ success: false, error: err });
    } else {
      if (result.length > 0) {
        var email = result[0].email;
        var username = result[0].user_name;


        var insertSql = "CALL Attendance(?, ?, ?, ?, ?, ?)";
        con.query(insertSql, [updateType, latitude, longitude, range_status, email, username], function (err, result) {
          if (err) {
            console.error("An error occurred while storing checkout time:", err);
            res.status(500).json({ success: false, error: err });
          } else {
            console.log("Checkout time stored for label:", label);
            res.json({ success: true });
          }
        });
      } else {
        console.error("User not found with label:", label);
        res.status(404).json({ success: false, error: "User not found" });
      }
    }
  });
});

router.post("/storeCheckinTime", function (req, res, next) {
  var label = req.body.label;
  var updateType = "in";
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  var range_status = req.body.range_status;

  var selectSql = "SELECT email, user_name FROM user_master WHERE user_name = ?";
  con.query(selectSql, [label], function (err, result) {
    if (err) {
      console.error("An error occurred while retrieving user details:", err);
      res.status(500).json({ success: false, error: err });
    } else {
      if (result.length > 0) {
        var email = result[0].email;
        var username = result[0].user_name;


        var insertSql = "CALL Attendance(?, ?, ?, ?, ?, ?)";
        con.query(insertSql, [updateType, latitude, longitude, range_status, email, username], function (err, result) {
          if (err) {
            console.error("An error occurred while storing check-in time:", err);
            res.status(500).json({ success: false, error: err });
          } else {
            console.log("Check-in time stored for label:", label);
            res.json({ success: true });
          }
        });
      } else {
        console.error("User not found with label:", label);
        res.status(404).json({ success: false, error: "User not found" });
      }
    }
  });
});


router.get("/report", function (req, res, next) {
  var callProc = "CALL get_attendance_report()";
  con.query(callProc, function (error, results) {
    if (error) throw error;

    const attendanceData = results[0];

    const weekWiseData = {};
    results[1].forEach((entry) => {
      const {
        user_name,
        week,
        present_count,
        halfday_count,
        absent_count,
        total_count,
      } = entry;
      if (!weekWiseData[user_name]) {
        weekWiseData[user_name] = {};
      }
      weekWiseData[user_name][week] = {
        Present: (present_count / total_count) * 100,
        Halfday: (halfday_count / total_count) * 100,
        Absent: (absent_count / total_count) * 100,
      };
    });

    const userData = {};
    attendanceData.forEach((entry) => {
      const { user_name, attendance_mark } = entry;
      if (!userData[user_name]) {
        userData[user_name] = {
          Present: 0,
          Absent: 0,
          Halfday: 0,
        };
      }
      userData[user_name][attendance_mark]++;
    });

    res.render("report", {
      title: "Report",
      rows: attendanceData,
      weekWiseData: JSON.stringify(weekWiseData),
      userData: JSON.stringify(userData),
    });
  });
});


// function getUserIDFromLabel(label) {
//   return new Promise((resolve, reject) => {
//     const callProc = "CALL get_user_id_by_label(?)";
//     con.query(callProc, [label], (error, result) => {
//       if (error) {
//         console.error('Error calling get_user_id_by_label stored procedure:', error);
//         reject(error);
//       } else {
//         if (result[0].length > 0) {
//           resolve(result[0][0].user_name);
//         } else {
//           resolve(null);
//         }
//       }
//     });
//   });
// }


router.get('/details/:username', function(req, res, next) {
  const userName = req.params.username;
  const getUserDetailsSql = "CALL GetUserDetailsByUsername(?)";

  con.query(getUserDetailsSql, [userName], function(err, result, fields) {
    if (err) {
      console.error('An error occurred while fetching user details:', err);
      res.redirect('/dashboard');
    } else {
      if (result[0].length > 0) {
        res.render('details', { title: 'User Details', users: result[0] }); 
      } else {
        res.redirect('/dashboard');
      }
    }
  });
});


router.get("/attendance/:user_name", function (req, res, next) {
  const user_name = req.params.user_name;
  con.query("CALL get_attendance_data(?)", [user_name], (err, rows) => {
    if (!err) {
      res.json(rows[0]);
    } else {
      console.log(err);
      res.sendStatus(500);
    }
  });
});


router.get("/attendance/summary/:user_name", function (req, res, next) {
  const user_name = req.params.user_name;

  con.query("CALL get_attendance_summary(?)", [user_name], (err, rows) => {
    if (!err) {
      res.json(rows[0]);
    } else {
      console.log(err);
      res.sendStatus(500);
    }
  });
});




module.exports = router;
