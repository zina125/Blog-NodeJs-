const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const { protect } = require("../middlewares/auth");
const { restrictTo } = require("../middlewares/restrictTo");

router.post("/signup", usersController.signup);
router.post("/login", usersController.login);

router.get("/", protect, restrictTo("admin"), usersController.getUsers);
router.get("/:id", protect, usersController.getUserById);
router.put("/:id", usersController.updateUserById);
router.delete("/:id", protect, restrictTo("admin"), usersController.deleteUserById);

module.exports = router;
