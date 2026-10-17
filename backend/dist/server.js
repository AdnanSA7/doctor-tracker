"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../packages/shared/dist/index.js
var require_dist = __commonJS({
  "../packages/shared/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.updateUserSchema = exports2.createUserSchema = exports2.paginationQuerySchema = exports2.updatePatientSchema = exports2.createPatientSchema = exports2.updateDoctorSchema = exports2.createDoctorSchema = exports2.loginSchema = void 0;
    var zod_1 = require("zod");
    exports2.loginSchema = zod_1.z.object({
      email: zod_1.z.string().email("Invalid email address").toLowerCase().trim(),
      password: zod_1.z.string().min(6, "Password must be at least 6 characters")
    });
    exports2.createDoctorSchema = zod_1.z.object({
      name: zod_1.z.string().min(2, "Doctor name is required").trim(),
      specialization: zod_1.z.string().min(2, "Specialization is required").trim(),
      hospital: zod_1.z.string().min(2, "Hospital name is required").trim(),
      phone: zod_1.z.string().min(7, "Valid phone number is required").trim(),
      email: zod_1.z.string().email("Invalid email address").toLowerCase().trim()
    });
    exports2.updateDoctorSchema = exports2.createDoctorSchema.partial();
    exports2.createPatientSchema = zod_1.z.object({
      name: zod_1.z.string().min(2, "Patient name is required").trim(),
      age: zod_1.z.number().int().min(0, "Age must be 0 or greater").max(150, "Invalid age"),
      gender: zod_1.z.enum(["Male", "Female", "Other"]).optional(),
      condition: zod_1.z.string().min(2, "Condition is required").trim(),
      phone: zod_1.z.string().optional(),
      email: zod_1.z.string().email("Invalid email address").optional().or(zod_1.z.literal("")),
      doctorId: zod_1.z.string().min(1, "Doctor ID is required")
    });
    exports2.updatePatientSchema = exports2.createPatientSchema.partial();
    exports2.paginationQuerySchema = zod_1.z.object({
      page: zod_1.z.coerce.number().int().positive().default(1),
      limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
      search: zod_1.z.string().optional().default(""),
      sortBy: zod_1.z.string().optional().default("createdAt"),
      sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
      from: zod_1.z.string().optional(),
      to: zod_1.z.string().optional(),
      specialization: zod_1.z.string().optional(),
      hospital: zod_1.z.string().optional(),
      condition: zod_1.z.string().optional(),
      doctorId: zod_1.z.string().optional()
    });
    exports2.createUserSchema = zod_1.z.object({
      name: zod_1.z.string().min(2, "Name is required").trim(),
      email: zod_1.z.string().email("Invalid email address").toLowerCase().trim(),
      password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
      role: zod_1.z.enum(["admin", "staff", "viewer"]).default("staff"),
      isActive: zod_1.z.boolean().optional().default(true)
    });
    exports2.updateUserSchema = exports2.createUserSchema.partial().omit({ password: true });
  }
});

// src/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => handler
});
module.exports = __toCommonJS(server_exports);
var import_dotenv = __toESM(require("dotenv"));

// src/app.ts
var import_express7 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_morgan = __toESM(require("morgan"));
var import_express_session = __toESM(require("express-session"));
var import_connect_mongo = __toESM(require("connect-mongo"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var import_cookie_parser = __toESM(require("cookie-parser"));

// src/modules/auth/auth.routes.ts
var import_express = require("express");

// src/modules/auth/auth.controller.ts
var import_bcrypt = __toESM(require("bcrypt"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));

// src/models/Admin.ts
var import_mongoose = __toESM(require("mongoose"));
var AdminSchema = new import_mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager", "viewer"], default: "admin" },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);
var Admin = import_mongoose.default.model("Admin", AdminSchema);

// src/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-jwt-secret-key-12345";
async function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required. Please log in."
        }
      });
      return;
    }
    let decoded;
    try {
      decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired authentication token."
        }
      });
      return;
    }
    let admin;
    try {
      admin = await Admin.findById(decoded.adminId);
    } catch (dbErr) {
      console.error("[Auth Middleware] Database error:", dbErr);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not verify authorization status due to database error."
        }
      });
      return;
    }
    if (!admin || !admin.isActive) {
      res.clearCookie("token");
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Account has been deactivated or removed. Please log in again."
        }
      });
      return;
    }
    req.admin = admin;
    req.adminId = admin._id.toString();
    return next();
  } catch (err) {
    next(err);
  }
}
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Access denied. Insufficient permissions for this role."
        }
      });
      return;
    }
    next();
  };
}

// src/modules/auth/auth.controller.ts
var JWT_SECRET2 = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-jwt-secret-key-12345";
async function login(req, res) {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !admin.isActive) {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
    });
    return;
  }
  const isPasswordValid = await import_bcrypt.default.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
    });
    return;
  }
  const payload = {
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role
  };
  const token = import_jsonwebtoken2.default.sign(payload, JWT_SECRET2, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  });
  if (req.session) {
    req.session.adminId = admin._id.toString();
    req.session.email = admin.email;
  }
  res.json({
    success: true,
    data: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString()
    }
  });
}
async function logout(req, res) {
  res.clearCookie("token");
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true, data: { message: "Logged out successfully" } });
    });
  } else {
    res.json({ success: true, data: { message: "Logged out successfully" } });
  }
}
async function getCurrentAdmin(req, res) {
  const admin = req.admin || (req.adminId ? await Admin.findById(req.adminId) : null);
  if (!admin) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" }
    });
    return;
  }
  res.json({
    success: true,
    data: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString()
    }
  });
}
async function streamAuthEvents(req, res) {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    let isClosed = false;
    const safeWrite = (data) => {
      if (isClosed) return;
      try {
        res.write(`data: ${data}

`);
      } catch (err) {
        isClosed = true;
      }
    };
    safeWrite(JSON.stringify({ type: "CONNECTED", timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
    const adminId = req.adminId;
    const intervalId = setInterval(async () => {
      if (isClosed || !adminId) {
        clearInterval(intervalId);
        return;
      }
      try {
        let admin;
        try {
          admin = await Admin.findById(adminId);
        } catch (dbErr) {
          console.error("[SSE] Database error during periodic auth check:", dbErr);
          safeWrite(JSON.stringify({ type: "REVOKED", message: "Database error verification" }));
          clearInterval(intervalId);
          isClosed = true;
          res.end();
          return;
        }
        if (!admin || !admin.isActive) {
          safeWrite(JSON.stringify({ type: "REVOKED", message: "Access revoked" }));
          clearInterval(intervalId);
          isClosed = true;
          res.end();
          return;
        }
        safeWrite(JSON.stringify({ type: "PING", timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
      } catch (err) {
        console.error("[SSE] Error during periodic auth check:", err);
      }
    }, 15e3);
    req.on("close", () => {
      isClosed = true;
      clearInterval(intervalId);
      try {
        res.end();
      } catch (e) {
      }
    });
  } catch (err) {
    console.error("[SSE] Stream initialization error:", err);
    if (!res.headersSent) {
      res.status(500).end();
    }
  }
}

// src/middleware/validate.ts
function validate(schema) {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

// src/modules/auth/auth.routes.ts
var import_shared = __toESM(require_dist());
var router = (0, import_express.Router)();
router.post("/login", validate({ body: import_shared.loginSchema }), login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentAdmin);
router.get("/events", requireAuth, streamAuthEvents);
var auth_routes_default = router;

// src/modules/doctors/doctors.routes.ts
var import_express2 = require("express");

// src/models/Doctor.ts
var import_mongoose2 = __toESM(require("mongoose"));
var DoctorSchema = new import_mongoose2.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    specialization: { type: String, required: true, trim: true, index: true },
    hospital: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true }
  },
  { timestamps: true }
);
DoctorSchema.index({ name: "text", specialization: "text", hospital: "text", email: "text" });
DoctorSchema.index({ createdAt: -1 });
var Doctor = import_mongoose2.default.model("Doctor", DoctorSchema);

// src/models/Patient.ts
var import_mongoose3 = __toESM(require("mongoose"));
var PatientSchema = new import_mongoose3.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    condition: { type: String, required: true, trim: true, index: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    doctorId: { type: import_mongoose3.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true }
  },
  { timestamps: true }
);
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ doctorId: 1, condition: 1 });
var Patient = import_mongoose3.default.model("Patient", PatientSchema);

// src/modules/doctors/doctors.controller.ts
async function getDoctors(req, res) {
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { specialization: { $regex: search, $options: "i" } },
      { hospital: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }
  if (query.specialization) {
    filter.specialization = { $regex: new RegExp(`^${query.specialization}$`, "i") };
  }
  if (query.hospital) {
    filter.hospital = { $regex: new RegExp(`^${query.hospital}$`, "i") };
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) {
      const fromDate = new Date(query.from);
      fromDate.setHours(0, 0, 0, 0);
      filter.createdAt.$gte = fromDate;
    }
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }
  const allowedSortFields = ["name", "specialization", "hospital", "createdAt", "email"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOptions = { [sortField]: sortOrder, _id: 1 };
  const total = await Doctor.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;
  const doctors = await Doctor.find(filter).sort(sortOptions).skip(skip).limit(limit).lean();
  const doctorsWithCount = await Promise.all(
    doctors.map(async (doc) => {
      const patientCount = await Patient.countDocuments({ doctorId: doc._id });
      return {
        id: doc._id.toString(),
        name: doc.name,
        specialization: doc.specialization,
        hospital: doc.hospital,
        phone: doc.phone,
        email: doc.email,
        patientCount,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
    })
  );
  res.json({
    success: true,
    data: doctorsWithCount,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
}
async function createDoctor(req, res) {
  const data = req.body;
  const doctor = await Doctor.create(data);
  res.status(201).json({
    success: true,
    data: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
      patientCount: 0,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString()
    }
  });
}
async function getDoctorById(req, res) {
  const { id } = req.params;
  const doctor = await Doctor.findById(id).lean();
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Doctor not found" }
    });
    return;
  }
  const patientCount = await Patient.countDocuments({ doctorId: doctor._id });
  res.json({
    success: true,
    data: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
      patientCount,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString()
    }
  });
}
async function updateDoctor(req, res) {
  const { id } = req.params;
  const data = req.body;
  const doctor = await Doctor.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Doctor not found" }
    });
    return;
  }
  const patientCount = await Patient.countDocuments({ doctorId: doctor._id });
  res.json({
    success: true,
    data: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
      patientCount,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString()
    }
  });
}
async function deleteDoctor(req, res) {
  const { id } = req.params;
  const force = req.query.force === "true";
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Doctor not found" }
    });
    return;
  }
  const patientCount = await Patient.countDocuments({ doctorId: doctor._id });
  if (patientCount > 0 && !force) {
    res.status(400).json({
      success: false,
      error: {
        code: "DOCTOR_HAS_PATIENTS",
        message: `Cannot delete doctor while ${patientCount} patients are assigned. Reassign or delete patients first, or pass force=true.`
      }
    });
    return;
  }
  if (force && patientCount > 0) {
    await Patient.deleteMany({ doctorId: doctor._id });
  }
  await Doctor.findByIdAndDelete(id);
  res.json({
    success: true,
    data: { message: "Doctor deleted successfully" }
  });
}
async function getDoctorPatients(req, res) {
  const { id } = req.params;
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Doctor not found" }
    });
    return;
  }
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";
  const condition = query.condition || "";
  const filter = { doctorId: doctor._id };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { condition: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }
  if (condition) {
    filter.condition = { $regex: new RegExp(`^${condition}$`, "i") };
  }
  const total = await Patient.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;
  const patients = await Patient.find(filter).sort({ createdAt: -1, _id: 1 }).skip(skip).limit(limit).lean();
  const patientsDto = patients.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    age: p.age,
    gender: p.gender,
    condition: p.condition,
    phone: p.phone,
    email: p.email,
    doctorId: p.doctorId.toString(),
    doctor: {
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital
    },
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  }));
  res.json({
    success: true,
    data: patientsDto,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
}
async function createDoctorPatient(req, res) {
  const { id } = req.params;
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Doctor not found" }
    });
    return;
  }
  const data = req.body;
  const patient = await Patient.create({
    ...data,
    doctorId: doctor._id
  });
  res.status(201).json({
    success: true,
    data: {
      id: patient._id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      condition: patient.condition,
      phone: patient.phone,
      email: patient.email,
      doctorId: doctor._id.toString(),
      doctor: {
        id: doctor._id.toString(),
        name: doctor.name,
        specialization: doctor.specialization,
        hospital: doctor.hospital
      },
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString()
    }
  });
}

// src/modules/doctors/doctors.routes.ts
var import_shared2 = __toESM(require_dist());
var router2 = (0, import_express2.Router)();
router2.use(requireAuth);
router2.get("/", getDoctors);
router2.get("/:id", getDoctorById);
router2.get("/:id/patients", getDoctorPatients);
router2.post("/", requireRole(["admin", "manager", "staff"]), validate({ body: import_shared2.createDoctorSchema }), createDoctor);
router2.patch("/:id", requireRole(["admin", "manager", "staff"]), validate({ body: import_shared2.updateDoctorSchema }), updateDoctor);
router2.delete("/:id", requireRole(["admin", "manager", "staff"]), deleteDoctor);
router2.post("/:id/patients", requireRole(["admin", "manager", "staff"]), validate({ body: import_shared2.createPatientSchema.omit({ doctorId: true }) }), createDoctorPatient);
var doctors_routes_default = router2;

// src/modules/patients/patients.routes.ts
var import_express3 = require("express");

// src/modules/patients/patients.controller.ts
async function getAllPatients(req, res) {
  const query = req.query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search || "";
  const condition = query.condition || "";
  const doctorId = query.doctorId || "";
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { condition: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }
  if (condition) {
    filter.condition = { $regex: new RegExp(`^${condition}$`, "i") };
  }
  if (doctorId) {
    filter.doctorId = doctorId;
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) {
      const fromDate = new Date(query.from);
      fromDate.setHours(0, 0, 0, 0);
      filter.createdAt.$gte = fromDate;
    }
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }
  const allowedSortFields = ["name", "age", "condition", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOptions = { [sortField]: sortOrder, _id: 1 };
  const total = await Patient.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;
  const patients = await Patient.find(filter).populate("doctorId").sort(sortOptions).skip(skip).limit(limit).lean();
  const patientsDto = patients.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    age: p.age,
    gender: p.gender,
    condition: p.condition,
    phone: p.phone,
    email: p.email,
    doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
    doctor: p.doctorId && typeof p.doctorId === "object" ? {
      id: p.doctorId._id.toString(),
      name: p.doctorId.name,
      specialization: p.doctorId.specialization,
      hospital: p.doctorId.hospital
    } : void 0,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  }));
  res.json({
    success: true,
    data: patientsDto,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
}
async function getPatientById(req, res) {
  const { id } = req.params;
  const patient = await Patient.findById(id).populate("doctorId").lean();
  if (!patient) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Patient not found" }
    });
    return;
  }
  const p = patient;
  res.json({
    success: true,
    data: {
      id: p._id.toString(),
      name: p.name,
      age: p.age,
      gender: p.gender,
      condition: p.condition,
      phone: p.phone,
      email: p.email,
      doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
      doctor: p.doctorId && typeof p.doctorId === "object" ? {
        id: p.doctorId._id.toString(),
        name: p.doctorId.name,
        specialization: p.doctorId.specialization,
        hospital: p.doctorId.hospital
      } : void 0,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    }
  });
}
async function updatePatient(req, res) {
  const { id } = req.params;
  const data = req.body;
  if (data.doctorId) {
    const doctorExists = await Doctor.findById(data.doctorId);
    if (!doctorExists) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_DOCTOR", message: "Assigned doctor does not exist" }
      });
      return;
    }
  }
  const patient = await Patient.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate("doctorId");
  if (!patient) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Patient not found" }
    });
    return;
  }
  const p = patient;
  res.json({
    success: true,
    data: {
      id: p._id.toString(),
      name: p.name,
      age: p.age,
      gender: p.gender,
      condition: p.condition,
      phone: p.phone,
      email: p.email,
      doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
      doctor: p.doctorId && typeof p.doctorId === "object" ? {
        id: p.doctorId._id.toString(),
        name: p.doctorId.name,
        specialization: p.doctorId.specialization,
        hospital: p.doctorId.hospital
      } : void 0,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    }
  });
}
async function deletePatient(req, res) {
  const { id } = req.params;
  const patient = await Patient.findByIdAndDelete(id);
  if (!patient) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Patient not found" }
    });
    return;
  }
  res.json({
    success: true,
    data: { message: "Patient deleted successfully" }
  });
}

// src/modules/patients/patients.routes.ts
var import_shared3 = __toESM(require_dist());
var router3 = (0, import_express3.Router)();
router3.use(requireAuth);
router3.get("/", getAllPatients);
router3.get("/:id", getPatientById);
router3.patch("/:id", requireRole(["admin", "manager", "staff"]), validate({ body: import_shared3.updatePatientSchema }), updatePatient);
router3.delete("/:id", requireRole(["admin", "manager", "staff"]), deletePatient);
var patients_routes_default = router3;

// src/modules/dashboard/dashboard.routes.ts
var import_express4 = require("express");

// src/modules/dashboard/dashboard.controller.ts
async function getDashboardSummary(req, res) {
  const totalDoctors = await Doctor.countDocuments();
  const totalPatients = await Patient.countDocuments();
  const patientsPerDoctorAvg = totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(1)) : 0;
  const recentDoctorsRaw = await Doctor.find().sort({ createdAt: -1 }).limit(5).lean();
  const recentPatientsRaw = await Patient.find().populate("doctorId").sort({ createdAt: -1 }).limit(5).lean();
  const recentDoctors = recentDoctorsRaw.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    specialization: d.specialization,
    hospital: d.hospital,
    phone: d.phone,
    email: d.email,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }));
  const recentPatients = recentPatientsRaw.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    age: p.age,
    gender: p.gender,
    condition: p.condition,
    phone: p.phone,
    email: p.email,
    doctorId: p.doctorId?._id?.toString() || p.doctorId?.toString(),
    doctor: p.doctorId && typeof p.doctorId === "object" ? {
      id: p.doctorId._id.toString(),
      name: p.doctorId.name,
      specialization: p.doctorId.specialization,
      hospital: p.doctorId.hospital
    } : void 0,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  }));
  res.json({
    success: true,
    data: {
      totalDoctors,
      totalPatients,
      patientsPerDoctorAvg,
      recentDoctors,
      recentPatients
    }
  });
}
async function getDashboardAnalytics(req, res) {
  const conditionDistributionRaw = await Patient.aggregate([
    { $group: { _id: "$condition", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  const conditionDistribution = conditionDistributionRaw.map((item) => ({
    condition: item._id || "Unknown",
    count: item.count
  }));
  const patientsPerDoctorRaw = await Patient.aggregate([
    { $group: { _id: "$doctorId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctor"
      }
    },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        doctorName: { $ifNull: ["$doctor.name", "Unassigned"] },
        count: 1
      }
    }
  ]);
  const patientsPerDoctor = patientsPerDoctorRaw.map((item) => ({
    doctorName: item.doctorName,
    count: item.count
  }));
  const patientsTimelineRaw = await Patient.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);
  const patientsTimeline = patientsTimelineRaw.map((item) => ({
    date: item._id,
    count: item.count
  }));
  const doctorsTimelineRaw = await Doctor.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);
  const doctorsTimeline = doctorsTimelineRaw.map((item) => ({
    date: item._id,
    count: item.count
  }));
  res.json({
    success: true,
    data: {
      patientsTimeline,
      doctorsTimeline,
      conditionDistribution,
      patientsPerDoctor
    }
  });
}

// src/modules/dashboard/dashboard.routes.ts
var router4 = (0, import_express4.Router)();
router4.use(requireAuth);
router4.get("/summary", getDashboardSummary);
router4.get("/analytics", getDashboardAnalytics);
var dashboard_routes_default = router4;

// src/modules/users/users.routes.ts
var import_express5 = require("express");

// src/modules/users/users.controller.ts
var import_bcrypt2 = __toESM(require("bcrypt"));
async function getUsers(req, res) {
  const users = await Admin.find().sort({ createdAt: -1 }).lean();
  const usersDto = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive ?? true,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString()
  }));
  res.json({
    success: true,
    data: usersDto
  });
}
async function createUser(req, res) {
  const data = req.body;
  const existing = await Admin.findOne({ email: data.email });
  if (existing) {
    res.status(409).json({
      success: false,
      error: { code: "DUPLICATE_EMAIL", message: "An account with this email already exists" }
    });
    return;
  }
  const passwordHash = await import_bcrypt2.default.hash(data.password, 12);
  const user = await Admin.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role || "staff",
    isActive: data.isActive ?? true
  });
  res.status(201).json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  });
}
async function updateUser(req, res) {
  const { id } = req.params;
  const data = req.body;
  const targetUser = await Admin.findById(id);
  if (!targetUser) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" }
    });
    return;
  }
  if ((data.isActive === false || data.role && data.role !== "admin") && targetUser.role === "admin") {
    const activeAdminCount = await Admin.countDocuments({ role: "admin", isActive: true, _id: { $ne: id } });
    if (activeAdminCount === 0) {
      res.status(400).json({
        success: false,
        error: { code: "CANNOT_MODIFY_LAST_ADMIN", message: "Cannot deactivate or demote the last active administrator." }
      });
      return;
    }
  }
  const user = await Admin.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" }
    });
    return;
  }
  res.json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  });
}
async function deleteUser(req, res) {
  const { id } = req.params;
  const targetUser = await Admin.findById(id);
  if (!targetUser) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" }
    });
    return;
  }
  if (targetUser.role === "admin") {
    const activeAdminCount = await Admin.countDocuments({ role: "admin", isActive: true, _id: { $ne: id } });
    if (activeAdminCount === 0) {
      res.status(400).json({
        success: false,
        error: { code: "CANNOT_DELETE_LAST_ADMIN", message: "Cannot delete the last active administrator." }
      });
      return;
    }
  }
  await Admin.findByIdAndDelete(id);
  res.json({
    success: true,
    data: { message: "User deleted successfully" }
  });
}

// src/modules/users/users.routes.ts
var import_shared4 = __toESM(require_dist());
var router5 = (0, import_express5.Router)();
router5.use(requireAuth);
router5.use(requireRole(["admin"]));
router5.get("/", getUsers);
router5.post("/", validate({ body: import_shared4.createUserSchema }), createUser);
router5.patch("/:id", validate({ body: import_shared4.updateUserSchema }), updateUser);
router5.delete("/:id", deleteUser);
var users_routes_default = router5;

// src/modules/permissions/permissions.routes.ts
var import_express6 = require("express");

// src/models/RolePermission.ts
var import_mongoose4 = __toESM(require("mongoose"));
var RolePermissionSchema = new import_mongoose4.Schema({
  role: { type: String, required: true, unique: true, enum: ["admin", "manager", "staff", "viewer"] },
  canViewDashboard: { type: Boolean, default: true },
  canManageDoctors: { type: Boolean, default: true },
  canManagePatients: { type: Boolean, default: true },
  canManageUsers: { type: Boolean, default: false },
  canDeleteRecords: { type: Boolean, default: true }
}, { timestamps: true });
var RolePermission = import_mongoose4.default.model("RolePermission", RolePermissionSchema);

// src/modules/permissions/permissions.controller.ts
async function getRolePermissions(req, res) {
  let permissions = await RolePermission.find().lean();
  if (permissions.length === 0) {
    const defaults = [
      { role: "admin", canViewDashboard: true, canManageDoctors: true, canManagePatients: true, canManageUsers: true, canDeleteRecords: true },
      { role: "manager", canViewDashboard: true, canManageDoctors: true, canManagePatients: true, canManageUsers: false, canDeleteRecords: true },
      { role: "staff", canViewDashboard: true, canManageDoctors: true, canManagePatients: true, canManageUsers: false, canDeleteRecords: false },
      { role: "viewer", canViewDashboard: true, canManageDoctors: false, canManagePatients: false, canManageUsers: false, canDeleteRecords: false }
    ];
    await RolePermission.insertMany(defaults);
    permissions = await RolePermission.find().lean();
  }
  res.json({
    success: true,
    data: permissions.map((p) => ({
      role: p.role,
      canViewDashboard: p.canViewDashboard,
      canManageDoctors: p.canManageDoctors,
      canManagePatients: p.canManagePatients,
      canManageUsers: p.canManageUsers,
      canDeleteRecords: p.canDeleteRecords
    }))
  });
}
async function updateRolePermissions(req, res) {
  const { role } = req.params;
  const data = req.body;
  const updated = await RolePermission.findOneAndUpdate(
    { role },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({
    success: true,
    data: {
      role: updated.role,
      canViewDashboard: updated.canViewDashboard,
      canManageDoctors: updated.canManageDoctors,
      canManagePatients: updated.canManagePatients,
      canManageUsers: updated.canManageUsers,
      canDeleteRecords: updated.canDeleteRecords
    }
  });
}

// src/modules/permissions/permissions.routes.ts
var router6 = (0, import_express6.Router)();
router6.use(requireAuth);
router6.get("/", getRolePermissions);
router6.put("/:role", requireRole(["admin"]), updateRolePermissions);
var permissions_routes_default = router6;

// src/middleware/error.ts
var import_zod = require("zod");
function errorHandler(err, req, res, next) {
  console.error("[Error]", err);
  let statusCode = err.statusCode || err.status || 500;
  let errorCode = err.code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected error occurred";
  let details = void 0;
  if (err instanceof import_zod.ZodError) {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Invalid request data";
    details = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message
    }));
  } else if (err.name === "CastError") {
    statusCode = 400;
    errorCode = "INVALID_ID";
    message = `Invalid ID format: ${err.value}`;
  } else if (err.code === 11e3) {
    statusCode = 409;
    errorCode = "DUPLICATE_KEY";
    message = "A record with this unique value already exists";
    details = err.keyValue;
  }
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...details && { details }
    },
    requestId: req.headers["x-request-id"] || void 0
  });
}

// src/config/db.ts
var import_mongoose5 = __toESM(require("mongoose"));
function ensureMongoUri(uri) {
  if (!uri) return "mongodb+srv://saiyedadnansa_db_user:G9jUsmC12re2Ii8b@cluster0.knracxb.mongodb.net/doctor-tracker";
  const urlWithoutQuery = uri.split("?")[0];
  const parts = urlWithoutQuery.split("/");
  if (parts.length <= 3 || parts.length === 4 && parts[3] === "") {
    return uri.replace(/\/?(\?|$)/, "/doctor-tracker$1");
  }
  return uri;
}
async function connectDB(uri) {
  if (import_mongoose5.default.connection.readyState === 1) {
    return;
  }
  const rawUri = uri || process.env.MONGODB_URI || "mongodb+srv://saiyedadnansa_db_user:G9jUsmC12re2Ii8b@cluster0.knracxb.mongodb.net/doctor-tracker";
  const mongoUri = ensureMongoUri(rawUri);
  try {
    await import_mongoose5.default.connect(mongoUri, {
      serverSelectionTimeoutMS: 1e4,
      // Increased for Vercel serverless cold starts
      bufferCommands: false
      // Don't buffer commands in serverless
    });
    console.log(`MongoDB connected successfully to ${mongoUri.replace(/:([^@]+)@/, ":***@")}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
}

// src/app.ts
function createApp() {
  const app = (0, import_express7.default)();
  app.set("trust proxy", 1);
  app.use((0, import_helmet.default)());
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  app.use(
    (0, import_cors.default)({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
          return callback(null, true);
        }
        if (origin === frontendUrl || origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }
        callback(null, true);
      },
      credentials: true
    })
  );
  if (process.env.NODE_ENV !== "test") {
    app.use((0, import_morgan.default)("dev"));
  }
  app.use((0, import_cookie_parser.default)());
  app.use(import_express7.default.json({ limit: "1mb" }));
  app.use(import_express7.default.urlencoded({ extended: true, limit: "1mb" }));
  if (process.env.NODE_ENV !== "test") {
    const limiter = (0, import_express_rate_limit.default)({
      windowMs: 15 * 60 * 1e3,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false
    });
    app.use("/api/", limiter);
  }
  const rawMongoUri = process.env.MONGODB_URI || "mongodb+srv://saiyedadnansa_db_user:G9jUsmC12re2Ii8b@cluster0.knracxb.mongodb.net/doctor-tracker";
  const mongoUri = ensureMongoUri(rawMongoUri);
  const rawSessionSecret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!rawSessionSecret || rawSessionSecret.trim() === "") {
      console.error("[FATAL CONFIG] SESSION_SECRET is not set in production. Sessions will be insecure. Set this in Vercel environment variables immediately.");
    }
  }
  const sessionSecret = rawSessionSecret && rawSessionSecret.trim() !== "" ? rawSessionSecret : "fallback-dev-secret-set-SESSION_SECRET-in-vercel";
  const sessionConfig = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    }
  };
  if (process.env.NODE_ENV !== "test") {
    sessionConfig.store = import_connect_mongo.default.create({
      mongoUrl: mongoUri,
      touchAfter: 24 * 3600
    });
  }
  app.use((0, import_express_session.default)(sessionConfig));
  app.get("/health", (req, res) => {
    res.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        uptime: process.uptime()
      }
    });
  });
  app.use("/api/v1/auth", auth_routes_default);
  app.use("/api/v1/doctors", doctors_routes_default);
  app.use("/api/v1/patients", patients_routes_default);
  app.use("/api/v1/dashboard", dashboard_routes_default);
  app.use("/api/v1/users", users_routes_default);
  app.use("/api/v1/permissions", permissions_routes_default);
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} not found`
      }
    });
  });
  app.use(errorHandler);
  return app;
}

// src/utils/bootstrap.ts
var import_bcrypt4 = __toESM(require("bcrypt"));

// src/utils/seed.ts
var import_bcrypt3 = __toESM(require("bcrypt"));
async function seedDemoData() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const passwordHash = await import_bcrypt3.default.hash(process.env.SEED_ADMIN_PASSWORD || "AdminPassword123!", 12);
      await Admin.create({
        name: process.env.SEED_ADMIN_NAME || "System Administrator",
        email: process.env.SEED_ADMIN_EMAIL || "admin@doctortracker.com",
        passwordHash,
        role: "admin",
        isActive: true
      });
      await Admin.create({
        name: "Hospital Manager",
        email: "manager@doctortracker.com",
        passwordHash,
        role: "manager",
        isActive: true
      });
      console.log("[Seed] Default administrators created.");
    }
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      const doctorsData = [
        { name: "Dr. Jane Smith", specialization: "Cardiology", hospital: "City General Hospital", phone: "+1-555-0191", email: "jane.smith@hospital.com" },
        { name: "Dr. Robert Chen", specialization: "Neurology", hospital: "St. Jude Medical Center", phone: "+1-555-0192", email: "robert.chen@hospital.com" },
        { name: "Dr. Emily Davis", specialization: "Pediatrics", hospital: "Childrens Hospital", phone: "+1-555-0193", email: "emily.davis@hospital.com" },
        { name: "Dr. Michael Johnson", specialization: "Orthopedics", hospital: "Metro Health Institute", phone: "+1-555-0194", email: "michael.johnson@hospital.com" },
        { name: "Dr. Sarah Wilson", specialization: "Dermatology", hospital: "Valley Medical Plaza", phone: "+1-555-0195", email: "sarah.wilson@hospital.com" }
      ];
      const createdDoctors = await Doctor.insertMany(doctorsData);
      console.log(`[Seed] Created ${createdDoctors.length} demo doctors.`);
      const conditions = ["Hypertension", "Type 2 Diabetes", "Asthma", "Migraine", "Arthritis", "Eczema", "Bronchitis", "Anxiety"];
      const genders = ["Male", "Female", "Other"];
      const firstNames = ["John", "Mary", "James", "Patricia", "Robert", "Jennifer", "William", "Linda", "David", "Elizabeth", "Richard", "Barbara", "Joseph", "Susan", "Thomas"];
      const lastNames = ["Doe", "Smith", "Johnson", "Brown", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Lee", "Perez", "Thompson", "Clark"];
      const patientsData = [];
      for (let i = 0; i < 20; i++) {
        const randomDoctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        const randomGender = genders[Math.floor(Math.random() * genders.length)];
        const randomAge = Math.floor(Math.random() * 70) + 18;
        patientsData.push({
          name: `${randomFirstName} ${randomLastName}`,
          age: randomAge,
          gender: randomGender,
          condition: randomCondition,
          phone: `+1-555-${String(Math.floor(Math.random() * 9e3) + 1e3)}`,
          email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@example.com`,
          doctorId: randomDoctor._id
        });
      }
      await Patient.insertMany(patientsData);
      console.log(`[Seed] Created ${patientsData.length} demo patients.`);
    }
  } catch (error) {
    console.error("[Seed] Error seeding demo data:", error);
  }
}

// src/utils/bootstrap.ts
async function bootstrapAdmin() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const name = process.env.SEED_ADMIN_NAME || "System Administrator";
      const email = process.env.SEED_ADMIN_EMAIL || "admin@doctortracker.com";
      const password = process.env.SEED_ADMIN_PASSWORD || "AdminPassword123!";
      const passwordHash = await import_bcrypt4.default.hash(password, 12);
      await Admin.create({
        name,
        email,
        passwordHash,
        role: "admin",
        isActive: true
      });
      console.log(`[Bootstrap] Initial admin created successfully: ${email}`);
    }
    await seedDemoData();
  } catch (error) {
    console.error("[Bootstrap] Error creating initial admin:", error);
  }
}

// src/server.ts
var import_serverless_http = __toESM(require("serverless-http"));
import_dotenv.default.config();
var PORT = process.env.PORT || 5e3;
var cachedHandler = null;
async function initServer() {
  await connectDB();
  await bootstrapAdmin();
  const app = createApp();
  return (0, import_serverless_http.default)(app);
}
if (!process.env.VERCEL) {
  initServer().then(() => {
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[API Server] Running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
async function handler(req, res) {
  if (!cachedHandler) {
    cachedHandler = await initServer();
  }
  return cachedHandler(req, res);
}
