import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import compression from "compression";
//Routes
import userRoutes from "./routes/users.js";
import companyRoutes from "./routes/company.js";
import branchRoutes from "./routes/branch.js";
import authRoutes from "./routes/auth.js";
import indicatorRoutes from "./routes/indicator.js";
import inputDatRoutes from "./routes/inputDats.js";
import listInputDatRoutes from "./routes/listInputDats.js";
import userSelectionsRoutes from "./routes/userSelections.js";

//Define the environment
const app = express();
app.use(
	compression({
		level: 6,
		threshold: 0,
		filter: (req, res) => {
			if (req.headers["x-no-compression"]) return false;
			return compression.filter(req, res);
		},
	})
);

const corsOptions = {
	origin: ["https://dashboard-am1.pages.dev", "http://localhost:5173"], // Permite solo este dominio
	credentials: true, // Permite cookies y autenticación
	methods: "GET,POST,PATCH,PUT,DELETE", // Métodos permitidos
	allowedHeaders: "Content-Type,Authorization", // Encabezados permitidos
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/company", companyRoutes);
app.use("/branch", branchRoutes);
// app.use('/api/mail', mailRoutes);
app.use("/indicator", indicatorRoutes);
app.use("/inputDat", inputDatRoutes);
app.use("/listInputDat", listInputDatRoutes);
app.use("/userSelections", userSelectionsRoutes);

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
