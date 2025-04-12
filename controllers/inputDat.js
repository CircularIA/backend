import { Types, startSession } from "mongoose";

//Models
import InputDat from "../models/InputDat.js";
import ListInputDat from "../models/ListInputDat.js";
import Branch from "../models/Branch.js";
import Indicator from "../models/Indicator.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import { redis } from "../utils/redisClient.js";

export const getInputDats = async (req, res) => {
	try {
		const { branch, year, month, day } = req.params;
		let startDate, endDate;

		if (year) {
			if (month) {
				if (day) {
					// Year, Month and Day provided
					startDate = new Date(year, month - 1, day);
					endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
				} else {
					// Year and Month provided
					startDate = new Date(year, month - 1);
					endDate = new Date(year, month, 0, 23, 59, 59, 999);
				}
			} else {
				// Only Year provided
				startDate = new Date(year, 0);
				endDate = new Date(year, 11, 31, 23, 59, 59, 999);
			}
		}

		let query = { branch };
		if (startDate && endDate) {
			query.date = {
				$gte: startDate,
				$lte: endDate,
			};
		}

		const inputDats = await InputDat.find(query).populate("listInputDat");
		if (!inputDats)
			return res.status(400).send({ message: "Input data not found" });
		return res.status(200).send({ inputDats });
	} catch (error) {
		console.log("error", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

//Hay que definir 4 casos para este endpoint
//Si no se recibe fecha, obtener todos los datos historicos
//Si se recibe el año, obtener todos los datos del año
//Si se recibe el año y el mes, obtener todos los datos del mes
//Si se recibe el año, el mes y el dia, obtener todos los datos del dia
export const getInputDatsByIndicator = async (req, res) => {
	try {
		await InputDat.validateGetInputDatsByIndicator(req.params);
		//Obtener los input dats de un indicador en una fecha
		const branch = req.params.branch;
		const indicator = req.params.indicator;
		//*El formato es year, month, day
		let year = req.params.year;
		let month = req.params.month;
		let day = req.params.day;
		//const date = req.params.date || new Date().toISOString().split('T')[0];
		if (!indicator)
			return res.status(400).send({ message: "Indicator is required" });
		if (!branch)
			return res.status(400).send({ message: "Branch is required" });
		const currentIndicator = await Indicator.findById(indicator);
		//Check if the indicator is assigned to the branch
		const currentBranch = await Branch.findById(branch);
		if (!currentBranch)
			return res.status(400).send({ message: "Branch not found" });
		console.log("currentBranch", currentBranch);
		const indicatorExist = currentBranch.indicators.find(
			(item) =>
				item.indicator.toString() === currentIndicator._id.toString()
		);
		if (!indicatorExist)
			return res
				.status(400)
				.send({ message: "Indicator not assigned to the branch" });
		//Check if the indicator is active on the branch
		if (!indicatorExist.active)
			return res
				.status(400)
				.send({ message: "Indicator is not active on the branch" });
		// const dateSplitted = date.split('-');
		if (!year) {
			//Obtener todos los datos historicos
			const inputDats = await InputDat.aggregate([
				{
					$match: {
						indicator: new Types.ObjectId(indicator),
						branch: new Types.ObjectId(branch),
					},
				},
			]);
			if (!inputDats)
				return res
					.status(400)
					.send({ message: "Input data not found" });
			return res.status(200).send({ inputDats });
		} else if (!month) {
			//Obtener todos los datos del año
			year = parseInt(year);
			const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
			const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
			const inputDats = await InputDat.aggregate([
				{
					$match: {
						date: {
							$gte: startDate,
							$lte: endDate,
						},
						indicator: new Types.ObjectId(indicator),
						branch: new Types.ObjectId(branch),
					},
				},
			]);
			if (!inputDats)
				return res
					.status(400)
					.send({ message: "Input data not found" });
			return res.status(200).send({ inputDats });
		} else if (!day) {
			//Obtener todos los datos de un mes
			year = parseInt(year);
			month = parseInt(month);
			const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
			const endDate = new Date(year, month, 0, 23, 59, 59, 999);
			const inputDats = await InputDat.aggregate([
				{
					$match: {
						date: {
							$gte: startDate,
							$lte: endDate,
						},
						indicator: new Types.ObjectId(indicator),
						branch: new Types.ObjectId(branch),
					},
				},
			]);
			if (!inputDats)
				return res
					.status(400)
					.send({ message: "Input data not found" });
			return res.status(200).send({ inputDats });
		} else {
			//Obtener todos los datos de un dia
			year = parseInt(year);
			month = parseInt(month);
			day = parseInt(day);
			const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
			const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
			const inputDats = await InputDat.aggregate([
				{
					$match: {
						date: {
							$gte: startDate,
							$lte: endDate,
						},
						indicator: new Types.ObjectId(indicator),
						branch: new Types.ObjectId(branch),
					},
				},
			]);
			if (!inputDats)
				return res
					.status(400)
					.send({ message: "Input data not found" });
			return res.status(200).send({ inputDats });
		}
	} catch (error) {
		console.log("error", error);
		if (error.isJoi)
			return res.status(400).send({ message: error.message });
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const registerInputDat = async (req, res) => {
	try {
		const { value, date, listInputDat } = req.body;

		const currentUser = req.user;
		//Obtener el usuario
		const user = await User.findOne({ _id: currentUser._id });
		req.body.user = {
			username: user.username,
			email: user.email,
			role: user.role,
		};
		//Obtain the indicator and the branch by params
		const { company, branch } = req.params;
		//Verify if the company and the branch exist
		const currentCompany = await Company.findOne({ _id: company });
		if (!currentCompany)
			return res.status(400).send({ message: "Company not found" });
		const currentBranch = await Branch.findOne({ _id: branch });
		if (!currentBranch)
			return res.status(400).send({ message: "Branch not found" });
		//Obtain the info of listInputDat
		const currentListInputDat = await ListInputDat.findById(listInputDat);
		if (!currentListInputDat) {
			return res.status(400).send({ message: "ListInputDat not found" });
		}
		// Extract the month and year from the provided date
		const providedDate = new Date(date);
		const month = providedDate.getMonth();
		const year = providedDate.getFullYear();
		// Check if there is an InputDat with the same name, company, branch and month/year.
		const existingInputDat = await InputDat.findOne({
			listInputDat,
			company,
			branch,
			date: {
				$gte: new Date(year, month, 1),
				$lt: new Date(year, month + 1, 1),
			},
		});

		if (existingInputDat) {
			return res.status(400).send({
				message:
					"An InputDat with the same name and date already exists for this branch.",
			});
		}
		req.body.company = company;
		req.body.branch = branch;

		// Register inputDat in Branch

		//Validate the input dat values using schema validator of mongoose
		await InputDat.validateNewInputDat(req.body);
		const newInputDat = new InputDat({
			_id: new Types.ObjectId(),
			...req.body,
		});
		const savedInputDat = await newInputDat.save();
		if (savedInputDat) {
			//Logic to add new input dat to the branch
			//Verify if the input dat is already in the branch
			const existingListInputDat = await Branch.findOne({
				_id: branch,
				inputDats: listInputDat,
			});

			if (!existingListInputDat) {
				currentBranch.inputDats.push(listInputDat);
				const response = await currentBranch.save();
				if (!response)
					return res
						.status(400)
						.send({ message: "InputDat not saved in branch" });
			}
			return res.status(200).send({
				message: "InputDat added successfully",
				branch: currentBranch._id,
				inputDat: savedInputDat,
			});
		}
	} catch (error) {
		if (error.name === "ValidationError")
			return res.status(400).send({ message: error.message });
		res.status(500).send({
			message: "Internal Server Error",
			error: error.message,
		});
	}
};

//Endpoint para registrar varios datos de entrada
export const registerInputDatsMany = async (req, res) => {
	const { company, branch } = req.params;
	//Format of input dats is {id, value, date, listInputDat}
	const { inputDats } = req.body;
	//Verificar que la compañia, sucursal  y el indicador exista
	const currentBranch = await Branch.findOne({ _id: branch });
	if (!currentBranch)
		return res.status(400).send({ message: "Branch not found" });
	//Check if the company exist
	const currentCompany = await Company.findOne({ _id: company });
	if (!currentCompany)
		return res.status(400).send({ message: "Company not found" });
	//Obtener usuario
	const currentUser = req.user;
	//Obtener el usuario
	const user = await User.findOne({ _id: currentUser._id });
	const session = await startSession();
	try {
		await session.withTransaction(async () => {
			// Validate the input dats
			for (let inputDat of inputDats) {
				inputDat.user = {
					username: user.username,
					email: user.email,
					role: user.role,
				};
				console.log("input dat", inputDat);
				//If the id is provided then the input dat is already registered, so it will be updated
				if (inputDat.id) {
					await InputDat.validateUpdateInputDat(inputDat);
					//Verify if the value is equal to the value of the input dat
					const currentInputDat = await InputDat.findOne({
						_id: inputDat.id,
					}).session(session);
					if (!currentInputDat)
						throw new Error("Input data not found");
					if (currentInputDat.value !== inputDat.value) {
						currentInputDat.value = inputDat.value;
						const savedInputDat = await currentInputDat.save({
							session,
						});
						if (!savedInputDat)
							throw new Error("Input data not updated");
					}
				} else {
					//If the id is not provided then the input dat is new and will be registered
					inputDat.company = company;
					inputDat.branch = branch;
					//Validate the input dat values using schema validator of mongoose
					await InputDat.validateNewInputDat(inputDat);
					const newInputDat = new InputDat({
						_id: new Types.ObjectId(),
						...inputDat,
					});
					//Havo to verify if the input dat is already registered in the month and year
					const auxDate = new Date(inputDat.date);
					console.log(
						"🚀 ~ awaitsession.withTransaction ~ auxDate:",
						auxDate
					);

					const existingInputDat = await InputDat.findOne({
						listInputDat: inputDat.listInputDat,
						company,
						branch,
						date: {
							$gte: new Date(
								auxDate.getFullYear(),
								auxDate.getMonth(),
								1
							),
							$lt: new Date(
								auxDate.getFullYear(),
								auxDate.getMonth() + 1,
								1
							),
						},
					});
					if (existingInputDat)
						throw new Error(
							"An InputDat with the same name and date already exists for this branch."
						);
					else {
						const savedInputDat = await newInputDat.save({
							session,
						});
						if (savedInputDat) {
							//Logic to add new input dat to the branch
							//Verify if the input dat is already in the branch
							const existingListInputDat = await Branch.findOne({
								_id: branch,
								inputDats: inputDat.listInputDat,
							}).session(session);

							if (!existingListInputDat) {
								currentBranch.inputDats.push(
									inputDat.listInputDat
								);
								const response = await currentBranch.save({
									session,
								});
								if (!response)
									throw new Error(
										"InputDat not saved in branch"
									);
							}
						}
					}
				}
			}
		});
		return res
			.status(200)
			.send({ message: "Inputs data added successfully" });
	} catch (error) {
		if (error.name === "ValidationError") {
			return res.status(400).send({ message: error.message });
		}
		res.status(500).send({
			message: "Internal Server Error",
			error: error.message,
		});
	}
};

export const checkExistingInputDats = async (req, res) => {
	try {
		console.log("Starting data verification process");

		const { company, branch } = req.params;
		const { data, year } = req.body;

		console.log(`Request params: company=${company}, branch=${branch}`);
		console.log(`Request body: year=${year}, data length=${data ? data.length : 'undefined'}`);

		if (!data || !Array.isArray(data)) {
			return res.status(400).send({ message: "Invalid data format. Expected an array." });
		}

		if (!year) {
			return res.status(400).send({ message: "Year is required" });
		}

		console.log("Verifying company and branch...");
		const currentCompany = await Company.findById(company);
		if (!currentCompany) {
			console.log("Company not found");
			return res.status(400).send({ message: "Company not found" });
		}

		const currentBranch = await Branch.findById(branch);
		if (!currentBranch) {
			console.log("Branch not found");
			return res.status(400).send({ message: "Branch not found" });
		}

		const months = [
			"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
			"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
		];

		// Extraer todos los nombres de indicadores del array de datos
		const indicatorNames = data
			.map(row => row["NOMBRE INDICADOR"])
			.filter(name => name); // Filtrar nombres vacíos

		console.log(`Found ${indicatorNames.length} unique indicators to check`);

		// Buscar todos los indicadores en una sola consulta
		const listInputDats = await ListInputDat.find({
			name: { $in: indicatorNames }
		});

		console.log(`Found ${listInputDats.length} existing indicators in database`);

		// Crear un mapa para acceso rápido por nombre
		const listInputDatMap = {};
		listInputDats.forEach(indicator => {
			listInputDatMap[indicator.name] = indicator;
		});

		// Crear un rango de fechas para todo el año
		const startDate = new Date(parseInt(year), 0, 1);
		const endDate = new Date(parseInt(year) + 1, 0, 1);

		// Obtener todos los IDs de los indicadores encontrados
		const listInputDatIds = listInputDats.map(indicator => indicator._id);

		// Buscar todos los datos existentes para estos indicadores en este año en una sola consulta
		const existingData = await InputDat.find({
			listInputDat: { $in: listInputDatIds },
			company: company,
			branch: branch,
			date: { $gte: startDate, $lt: endDate }
		});

		console.log(`Found ${existingData.length} existing data points for the year ${year}`);

		// Crear un mapa para acceso rápido a los datos existentes
		const existingDataMap = {};
		existingData.forEach(data => {
			const indicatorId = data.listInputDat.toString();
			const month = data.date.getMonth();
			
			if (!existingDataMap[indicatorId]) {
				existingDataMap[indicatorId] = {};
			}
			
			existingDataMap[indicatorId][month] = {
				exists: true,
				value: data.value,
				date: data.date,
				id: data._id.toString()
			};
		});

		// Objeto para almacenar los resultados de la verificación
		const verificationResults = {};

		// Procesar cada indicador
		for (const indicatorName of indicatorNames) {
			const listInputDat = listInputDatMap[indicatorName];
			
			if (!listInputDat) {
				// Si el indicador no existe, no hay datos que verificar
				verificationResults[indicatorName] = {
					exists: false,
					months: {}
				};
				continue;
			}
			
			// Si el indicador existe, verificar qué meses tienen datos
			const existingMonths = {};
			const indicatorId = listInputDat._id.toString();
			const indicatorData = existingDataMap[indicatorId] || {};
			
			for (let i = 0; i < months.length; i++) {
				const month = months[i];
				
				if (indicatorData[i]) {
					// Existe dato para este mes
					existingMonths[month] = indicatorData[i];
				} else {
					// No existe dato para este mes
					existingMonths[month] = {
						exists: false
					};
				}
			}
			
			verificationResults[indicatorName] = {
				exists: true,
				id: indicatorId,
				months: existingMonths
			};
		}
		
		// Preparar respuesta con los datos verificados
		const response = {
			year,
			company: currentCompany.name,
			branch: currentBranch.name,
			indicators: verificationResults,
			summary: {
				total: Object.keys(verificationResults).length,
				withExistingData: Object.values(verificationResults).filter(indicator => 
					indicator.exists && Object.values(indicator.months).some(month => month.exists)
				).length
			}
		};
		
		return res.status(200).send(response);
	} catch (error) {
		console.error("Error in checkExistingInputDats:", error);
		
		if (error.name === "ValidationError") {
			return res.status(400).send({ message: error.message });
		}
		
		res.status(500).send({
			message: "Internal Server Error",
			error: error.message,
		});
	}
};

export const importInputDats = async (req, res) => {
	try {
		console.log("Starting import process");

		const { company, branch } = req.params;
		const { data, year } = req.body;

		console.log(`Request params: company=${company}, branch=${branch}`);
		console.log(`Request body: year=${year}, data length=${data ? data.length : 'undefined'}`);

		if (!data || !Array.isArray(data)) {
			return res.status(400).send({ message: "Invalid data format. Expected an array." });
		}

		if (!year) {
			return res.status(400).send({ message: "Year is required" });
		}

		console.log("Verifying company and branch...");
		const currentCompany = await Company.findById(company);
		if (!currentCompany) {
			console.log("Company not found");
			return res.status(400).send({ message: "Company not found" });
		}

		const currentBranch = await Branch.findById(branch);
		if (!currentBranch) {
			console.log("Branch not found");
			return res.status(400).send({ message: "Branch not found" });
		}

		const currentUser = req.user;
		const userId = currentUser._id.toString();
		const user = await User.findById(userId);
		const userInfo = {
			username: user.username,
			email: user.email,
			role: user.role,
		};

		const months = [
			"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
			"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
		];

		const results = [];
		const errors = [];
		const bulkOps = [];
		const listInputCache = {};

		// Variables para medir progreso
		const totalRows = data.length;
		let completedRows = 0;
		
		// Generar un ID único para esta importación
		const importId = new Date().getTime();
		const redisKey = `import:${userId}:${importId}`;

		// Inicializar el progreso en Redis
		await redis.set(redisKey, JSON.stringify({ 
			importId,
			completed: 0, 
			total: totalRows, 
			status: 'in_progress',
			year,
			company,
			branch,
			startTime: new Date().toISOString()
		}));
		
		// Guardar el ID de la importación actual para este usuario
		await redis.set(`import:${userId}:current`, importId.toString());

		console.log("Processing each indicator data row...");
		for (const row of data) {
			const indicatorName = row["NOMBRE INDICADOR"];
			if (!indicatorName) {
				errors.push("Row missing indicator name");
				continue;
			}

			let listInputDat;
			if (listInputCache[indicatorName]) {
				listInputDat = listInputCache[indicatorName];
			} else {
				listInputDat = await ListInputDat.findOne({ name: indicatorName });

				if (!listInputDat) {
					listInputDat = new ListInputDat({
						_id: new Types.ObjectId(),
						name: indicatorName,
						description: `Imported indicator: ${indicatorName}`,
						measurement: "units",
						category: "Ambiental",
						subcategory: "Salida y valorización de Residuos, Productos y subproductos",
					});
					await listInputDat.save();
				}

				listInputCache[indicatorName] = listInputDat;
			}

			for (let i = 0; i < months.length; i++) {
				const month = months[i];
				const value = row[month];

				if (value === undefined || value === null || value === "") continue;

				const numericValue = parseFloat(value.toString().replace(",", "."));
				if (isNaN(numericValue)) {
					errors.push(`Invalid value for ${indicatorName} in ${month}: ${value}`);
					continue;
				}

				const date = new Date(parseInt(year), i, 1);

				bulkOps.push({
					insertOne: {
						document: {
							_id: new Types.ObjectId(),
							value: numericValue,
							date: date,
							listInputDat: listInputDat._id,
							company: company,
							branch: branch,
							user: userInfo
						}
					}
				});

				results.push({
					indicator: indicatorName,
					month: month,
					value: numericValue,
					date: date
				});
			}
			
			// Actualizar el progreso
			completedRows++;
			
			// Actualizar Redis cada 2 filas o al finalizar
			if (completedRows % 2 === 0 || completedRows === totalRows) {
				await redis.set(redisKey, JSON.stringify({ 
					importId,
					completed: completedRows, 
					total: totalRows,
					status: 'in_progress',
					year,
					company,
					branch,
					startTime: new Date().toISOString()
				}));
				console.log(`Progress updated: ${completedRows}/${totalRows} rows processed`);
			}
		}

		// Asegurarse de que Redis muestre el progreso correcto antes de ejecutar el bulkWrite final
		await redis.set(redisKey, JSON.stringify({ 
			importId,
			completed: totalRows, 
			total: totalRows,
			status: 'processing_final_batch',
			year,
			company,
			branch,
			startTime: new Date().toISOString()
		}));

		if (bulkOps.length > 0) {
			console.log(`Saving ${bulkOps.length} documents in bulk...`);
			await InputDat.bulkWrite(bulkOps);
		}

		// Marcar como completado en Redis
		await redis.set(redisKey, JSON.stringify({ 
			importId,
			completed: totalRows, 
			total: totalRows,
			status: 'completed',
			results: results.length,
			errors: errors.length,
			year,
			company,
			branch,
			startTime: new Date().toISOString(),
			endTime: new Date().toISOString()
		}));
		
		// Establecer un tiempo de expiración para la clave (24 horas)
		await redis.expire(redisKey, 86400);

		console.log("Import process completed.");
		return res.status(200).send({
			message: "Data imported successfully",
			imported: results.length,
			errors: errors.length > 0 ? errors : undefined,
			importId
		});

	} catch (error) {
		console.error("Error importing data:", error);
		
		// Registrar el error en Redis si hay un userId disponible
		if (req.user && req.user._id) {
			const userId = req.user._id.toString();
			const importId = await redis.get(`import:${userId}:current`);
			
			if (importId) {
				const redisKey = `import:${userId}:${importId}`;
				await redis.set(redisKey, JSON.stringify({ 
					importId,
					status: 'error',
					error: error.message,
					endTime: new Date().toISOString()
				}));
				await redis.expire(redisKey, 86400); // 24 horas
			}
		}
		
		if (error.name === "ValidationError") {
			return res.status(400).send({ message: error.message });
		}
		res.status(500).send({
			message: "Internal Server Error",
			error: error.message,
		});
	}
};

export const getImportProgress = async (req, res) => {
	try {
		// Verificar que req.user existe
		if (!req.user || !req.user._id) {
			return res.status(401).send({ message: "Usuario no autenticado" });
		}

		const userId = req.user._id.toString();
		
		// Obtener el ID de la importación actual
		const currentImportId = await redis.get(`import:${userId}:current`);
		
		if (!currentImportId) {
			return res.status(404).send({ message: "No import in progress" });
		}
		
		// Construir la clave para obtener los detalles de la importación
		const redisKey = `import:${userId}:${currentImportId}`;
		
		// Obtener los detalles de la importación
		let progressData = await redis.get(redisKey);
		let progress;
		
		// Manejar diferentes tipos de respuesta de Upstash Redis
		if (progressData === null) {
			return res.status(404).send({ message: "Import data not found" });
		} else if (typeof progressData === 'string') {
			// Si es una cadena, intentar parsearla como JSON
			try {
				progress = JSON.parse(progressData);
			} catch (e) {
				console.error("Error parsing progress data:", e);
				return res.status(500).send({ 
					message: "Error parsing progress data", 
					error: e.message 
				});
			}
		} else {
			// Si ya es un objeto, usarlo directamente
			progress = progressData;
		}
		
		// Calcular el porcentaje de progreso
		if (progress && progress.total > 0) {
			progress.progressPercentage = Math.round((progress.completed / progress.total) * 100);
		} else if (progress) {
			progress.progressPercentage = 0;
		}
		
		return res.status(200).send(progress);
	} catch (error) {
		console.error("Error getting import progress:", error);
		return res.status(500).send({ 
			message: "Error getting import progress", 
			error: error.message 
		});
	}
};

export const updateInputDat = async (req, res) => {
	try {
		//El formato sera un objeto
		const { id } = req.params;
		const { name, value, date, measurement } = req.body;
		const inputDat = await InputDat.findOne({ _id: id });
		if (!inputDat)
			return res.status(400).send({ message: "Input data not found" });
		inputDat.name = name;
		inputDat.value = value;
		inputDat.date = date;
		inputDat.measurement = measurement;
		const savedInputDat = await inputDat.save();
		if (!savedInputDat)
			return res.status(400).send({ message: "Input data not saved" });
		return res.status(200).send({ inputDat: savedInputDat });
	} catch (error) {
		console.log("error", error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const updateInputDats = async (req, res) => {
	try {
		//El formato sera un arreglo de objetos
		const { inputDats } = req.body;
		//User
		const user = await User.findOne({ _id: req.user._id });
		if (!user) return res.status(400).send({ message: "User not found" });

		const promises = inputDats.map(async (inputDat) => {
			//Validate the input dat values using schema validator of mongoose
			await InputDat.validateUpdateInputDat(inputDat);
			const { id, name, value, date, measurement } = inputDat;
			//Define using findOneAndUpdate
			const result = await InputDat.findOneAndUpdate(
				{
					_id: id,
				},
				{
					value,
					date,
					measurement,
					user: {
						name: user.username,
						email: user.email,
						role: user.role,
					},
				},
				{
					new: true,
				}
			);
			if (!result) throw new Error("Input data not found or not updated");
		});
		await Promise.all(promises);
		return res.status(200).send({ message: "Input data updated" });
	} catch (error) {
		console.log("error", error);
		if (error.isJoi)
			return res.status(400).send({ message: error.message });
		res.status(500).send({
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
