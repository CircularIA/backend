//Packages
import { Types } from "mongoose";

//Models
import Indicator from "../models/Indicator.js";
import Branch from "../models/Branch.js";
import InputDat from "../models/InputDat.js";
import ListInputDat from "../models/ListInputDat.js";
import e from "express";

//Functions
const getValue = (name, inputDatsValues) => {
	//El objetivo de esta funcion es obtener el valor de un indicador con los valores de los input dats
	if (name === "Porcentaje valorización ciclo biológico") {
		//Buscar en la variable inputDatsValues el valor del dato de entrada
		const valores = {
			generacionLodos: 0,
			valCompostaje: 0,
			valMasa: 0,
			valBiodigestion: 0,
			valTratamientoRiles: 0,
			entradaMunicipal: 0,
		};
		const details = {};
		inputDatsValues.forEach((inputDat) => {
			details[inputDat.name] = inputDat.value;
			if (inputDat.name === "Salida compostaje de lodo generado") {
				valores["generacionLodos"] = inputDat.value;
			} else if (inputDat.name === "Salida compostaje") {
				valores["valCompostaje"] = inputDat.value;
			} else if (inputDat.name === "Salida masas") {
				valores["valMasa"] = inputDat.value;
			} else if (inputDat.name === "Salida biodigestión") {
				valores["valBiodigestion"] = inputDat.value;
			} else if (inputDat.name === "Salida RILES tratados") {
				valores["valTratamientoRiles"] = inputDat.value;
			} else if (inputDat.name === "Salida residuos municipales") {
				valores["entradaMunicipal"] = inputDat.value;
			}
		});
		console.log("valores", valores);
		const numerador = valores["generacionLodos"] + valores["valCompostaje"] + valores["valMasa"] + valores["valBiodigestion"] + valores["valTratamientoRiles"];
		const denominador = numerador + valores["entradaMunicipal"] * 0.6;
		const result = numerador / denominador;
		return { result: result, details };
	} else if (name === "Porcentaje de valorización ciclo técnico") {
		const valores = {
			generacionLodos: 0,
			entradaMunicipal: 0,
			salidaPlastico: 0,
			salidaChatarraFerrosa: 0,
			salidaAluminio: 0,
			salidaTetrapack: 0,
			salidaIncineracionBiomasa: 0,
			salidaReutilizacion: 0,
			salidaPeligrosos: 0,
			salidaInerte: 0,
			entradaCircularAgua: 0,
		};
		const details = {};
		inputDatsValues.forEach((inputDat) => {
			details[inputDat.name] = inputDat.value;
			if (inputDat.name === "Salida residuos municipales") {
				valores["entradaMunicipal"] = inputDat.value;
			} else if (inputDat.name === "Salida Plástico") {
				valores["salidaPlastico"] = inputDat.value;
			} else if (inputDat.name === "Salida chatarra ferrosa") {
				valores["salidaChatarraFerrosa"] = inputDat.value;
			} else if (inputDat.name === "Salida aluminio") {
				valores["salidaAluminio"] = inputDat.value;
			} else if (inputDat.name === "Salida tetrapack") {
				valores["salidaTetrapack"] = inputDat.value;
			} else if (inputDat.name === "Salida Incineración de biomasa") {
				valores["salidaIncineracionBiomasa"] = inputDat.value;
			} else if (inputDat.name === "Salida reutilización") {
				valores["salidaReutilizacion"] = inputDat.value;
			} else if (inputDat.name === "Salida peligrosos") {
				valores["salidaPeligrosos"] = inputDat.value;
			} else if (inputDat.name === "Salida inertes") {
				valores["salidaInerte"] = inputDat.value;
			} else if (inputDat.name === "Entrada circular agua") {
				valores["entradaCircularAgua"] = inputDat.value;
			} else if (inputDat.name === "Salida compostaje de lodo generado") {
				valores["generacionLodos"] = inputDat.value;
			}
		});
		console.log("valores", valores);
		//Retornar el valor junto con el factor
		const numerador = valores["salidaChatarraFerrosa"] + valores["salidaPlastico"] + valores["salidaAluminio"] + valores["salidaTetrapack"] + valores["salidaIncineracionBiomasa"] + valores["salidaPeligrosos"]
		const denominador = valores["salidaChatarraFerrosa"] + valores["salidaPlastico"] + valores["salidaAluminio"] + valores["salidaTetrapack"] + valores["salidaReutilizacion"] + valores["salidaPeligrosos"] + valores["salidaInerte"] + valores["entradaMunicipal"] * 0.6 + valores["entradaMunicipal"] * (valores["generacionLodos"] - valores["entradaCircularAgua"])
		const result = numerador / denominador;
		return { result: result, details };
	} else if (name === "Porcentaje circularidad de salida") {
		const valores = {
			generacionLodos: 0,
			salidaCompostaje: 0,
			salidaMasas: 0,
			salidaBiodigestion: 0,
			salidaRiles: 0,
			salidaResiduosMunicipales: 0,
			salidaCartonPapel: 0,
			salidaPlastico: 0,
			salidaChatarraFerrosa: 0,
			salidaAluminio: 0,
			salidaTetrapack: 0,
			salidaIncineracionBiomasa: 0,
			salidaCoproceso: 0,
			salidaReutilizacion: 0,
			salidaPeligrosos: 0,
			salidaInerte: 0,
		};
		const details = {};
		inputDatsValues.forEach((inputDat) => {
			details[inputDat.name] = inputDat.value;
			if (inputDat.name === "Salida compostaje de lodo generado") {
				valores["generacionLodos"] += inputDat.value;
			} else if (inputDat.name === "Salida compostaje") {
				valores["salidaCompostaje"] += inputDat.value;
			} else if (inputDat.name === "Salida masas") {
				valores["salidaMasas"] += inputDat.value;
			} else if (inputDat.name === "Salida biodigestión") {
				valores["salidaBiodigestion"] += inputDat.value;
			} else if (inputDat.name === "Salida RILES tratados") {
				valores["salidaRiles"] += inputDat.value;
			} else if (inputDat.name === "Salida residuos municipales") {
				valores["salidaResiduosMunicipales"] += inputDat.value * 0.6;
			} else if (inputDat.name === "Salida Cartón/Papel") {
				valores["salidaCartonPapel"] += inputDat.value;
			} else if (inputDat.name === "Salida Plástico") {
				valores["salidaPlastico"] += inputDat.value;
			} else if (inputDat.name === "Salida chatarra ferrosa") {
				valores["salidaChatarraFerrosa"] += inputDat.value;
			} else if (inputDat.name === "Salida aluminio") {
				valores["salidaAluminio"] += inputDat.value;
			} else if (inputDat.name === "Salida tetrapack") {
				valores["salidaTetrapack"] += inputDat.value;
			} else if (inputDat.name === "Salida Incineración de biomasa") {
				valores["salidaIncineracionBiomasa"] += inputDat.value;
			} else if (inputDat.name === "Salida coproceso") {
				valores["salidaCoproceso"] += inputDat.value;
			} else if (inputDat.name === "Salida reutilización") {
				valores["salidaReutilizacion"] += inputDat.value;
			} else if (inputDat.name === "Salida peligrosos") {
				valores["salidaPeligrosos"] += inputDat.value;
			} else if (inputDat.name === "Salida inertes") {
				valores["salidaInerte"] += inputDat.value;
			}
		});
		const numerador =
			valores["generacionLodos"] +
			valores["salidaCompostaje"] +
			valores["salidaMasas"] +
			valores["salidaBiodigestion"] +
			valores["salidaRiles"] +
			valores["salidaCartonPapel"] +
			valores["salidaPlastico"] +
			valores["salidaChatarraFerrosa"] +
			valores["salidaAluminio"] +
			valores["salidaTetrapack"] +
			valores["salidaReutilizacion"];
		const denominador =
			valores["generacionLodos"] +
			valores["salidaCompostaje"] +
			valores["salidaMasas"] +
			valores["salidaBiodigestion"] +
			valores["salidaRiles"] +
			valores["salidaResiduosMunicipales"] +
			valores["salidaCartonPapel"] +
			valores["salidaPlastico"] +
			valores["salidaChatarraFerrosa"] +
			valores["salidaAluminio"] +
			valores["salidaTetrapack"] +
			valores["salidaIncineracionBiomasa"] +
			valores["salidaCoproceso"] +
			valores["salidaReutilizacion"] +
			valores["salidaPeligrosos"] +
			valores["salidaInerte"];
		const result = numerador / denominador;
		return { result: result, details };
	} else if (name === "Porcentaje desviación de relleno") {
		const valores = {
			generacionLodos: 0,
			salidaCompostaje: 0,
			salidaMasas: 0,
			salidaBiodigestion: 0,
			salidaRiles: 0,
			salidaResiduosMunicipales: 0,
			salidaCartonPapel: 0,
			salidaPlastico: 0,
			salidaChatarraFerrosa: 0,
			salidaAluminio: 0,
			salidaTetrapack: 0,
			salidaIncineracionBiomasa: 0,
			salidaCoproceso: 0,
			salidaReutilizacion: 0,
			salidaPeligrosos: 0,
			salidaInerte: 0,
		};
		const details = {};
		inputDatsValues.forEach((inputDat) => {
			details[inputDat.name] = inputDat.value;
			if (inputDat.name === "Salida compostaje de lodo generado") {
				valores["generacionLodos"] += inputDat.value;
			} else if (inputDat.name === "Salida compostaje") {
				valores["salidaCompostaje"] += inputDat.value;
			} else if (inputDat.name === "Salida masas") {
				valores["salidaMasas"] += inputDat.value;
			} else if (inputDat.name === "Salida biodigestión") {
				valores["salidaBiodigestion"] += inputDat.value;
			} else if (inputDat.name === "Salida RILES tratados") {
				valores["salidaRiles"] += inputDat.value;
			} else if (inputDat.name === "Salida residuos municipales") {
				valores["salidaResiduosMunicipales"] += inputDat.value * 0.6;
			} else if (inputDat.name === "Salida Cartón/Papel") {
				valores["salidaCartonPapel"] += inputDat.value;
			} else if (inputDat.name === "Salida Plástico") {
				valores["salidaPlastico"] += inputDat.value;
			} else if (inputDat.name === "Salida chatarra ferrosa") {
				valores["salidaChatarraFerrosa"] += inputDat.value;
			} else if (inputDat.name === "Salida aluminio") {
				valores["salidaAluminio"] += inputDat.value;
			} else if (inputDat.name === "Salida tetrapack") {
				valores["salidaTetrapack"] += inputDat.value;
			} else if (inputDat.name === "Salida Incineración de biomasa") {
				valores["salidaIncineracionBiomasa"] += inputDat.value;
			} else if (inputDat.name === "Salida coproceso") {
				valores["salidaCoproceso"] += inputDat.value;
			} else if (inputDat.name === "Salida reutilización") {
				valores["salidaReutilizacion"] += inputDat.value;
			} else if (inputDat.name === "Salida peligrosos") {
				valores["salidaPeligrosos"] += inputDat.value;
			} else if (inputDat.name === "Salida inertes") {
				valores["salidaInerte"] += inputDat.value;
			}
		});
		const numerador =
			valores["generacionLodos"] +
			valores["salidaCompostaje"] +
			valores["salidaMasas"] +
			valores["salidaBiodigestion"] +
			valores["salidaRiles"] +
			valores["salidaCartonPapel"] +
			valores["salidaPlastico"] +
			valores["salidaChatarraFerrosa"] +
			valores["salidaAluminio"] +
			valores["salidaTetrapack"] +
			valores["salidaIncineracionBiomasa"] +
			valores["salidaCoproceso"] +
			valores["salidaReutilizacion"];
		const denominador =
			valores["generacionLodos"] +
			valores["salidaCompostaje"] +
			valores["salidaMasas"] +
			valores["salidaBiodigestion"] +
			valores["salidaRiles"] +
			valores["salidaResiduosMunicipales"] +
			valores["salidaCartonPapel"] +
			valores["salidaPlastico"] +
			valores["salidaChatarraFerrosa"] +
			valores["salidaAluminio"] +
			valores["salidaTetrapack"] +
			valores["salidaIncineracionBiomasa"] +
			valores["salidaCoproceso"] +
			valores["salidaReutilizacion"] +
			valores["salidaPeligrosos"] +
			valores["salidaInerte"];
		const result = numerador / denominador;
		return { result: result, details };
	} else if (name === "Intensidad de agua") {
		const valores = {
			entradaAguaTotal: 0,
			empleadosTotales: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Entrada agua total") {
				valores["entradaAguaTotal"] = inputDat.value;
			}
			if (inputDat.name === "Empleados totales") {
				valores["empleadosTotales"] = inputDat.value;
			}
		})

		return valores["entradaAguaTotal"] / valores["empleadosTotales"];

	} else if (name === "Porcentaje circularidad agua de entrada") {
		const valores = {
			entradaAguaTotal: 0,
			entradaCircularMar: 0,
			entradaCircularSuperficial: 0,
			entradaCircularRegenerada: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Entrada agua total") {
				valores["entradaAguaTotal"] = inputDat.value;
			}
			if (inputDat.name === "Entada circular de agua de mar") {
				valores["entradaCircularMar"] = inputDat.value;
			}
			if (inputDat.name === "Entrada circular agua superficial y pozos de agua subterránea") {
				valores["entradaCircularSuperficial"] = inputDat.value;
			}
			if (inputDat.name === "Entrada circular  de agua regenerada") {
				valores["entradaCircularRegenerada"] = inputDat.value;
			}
		})

		const numerador = valores["entradaCircularMar"] + valores["entradaCircularSuperficial"] + valores["entradaCircularRegenerada"];
		const denominador = valores["entradaAguaTotal"];

		return numerador / denominador;

	} else if (name === "Porcentaje circularidad agua de salida") {
		const valores = {
			salidaCircular: 0,
			salidaLinealConsumo: 0,
			salidaLinealEvaporacion: 0,
			salidaLinealResiduoAgua: 0,
			salidaLinealExportacion: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Salida de agua circular") {
				valores["salidaCircular"] = inputDat.value;
			}
			if (inputDat.name === "Salida de agua lineal por consumo") {
				valores["salidaLinealConsumo"] = inputDat.value;
			}
			if (inputDat.name === "Salida agua lineal por evaporación") {
				valores["salidaLinealEvaporacion"] = inputDat.value;
			}
			if (inputDat.name === "Salida agua lineal por residuo de agua") {
				valores["salidaLinealResiduoAgua"] = inputDat.value;
			}
			if (inputDat.name === "Salida agua lineal por exportación de agua") {
				valores["salidaLinealExportacion"] = inputDat.value;
			}
		})

		const numerador = valores["salidaCircular"];
		const denominador = valores["salidaCircular"] + valores["salidaLinealConsumo"] + valores["salidaLinealEvaporacion"] + valores["salidaLinealResiduoAgua"] + valores["salidaLinealExportacion"];

		return numerador / denominador;
	} else if (name === "Porcentaje de energía renovable") {
		const valores = {
			entradaCombustibleCarbon: 0,
			entradaCombustibleDiesel: 0,
			entradaCombustiblePetroleo: 0,
			entradaCombustibleGas: 0,
			entradaCombustibleGasLicuado: 0,
			entradaCombustibleGasolina: 0,
			entradaElectricidad: 0,
			entradaOtrosCombustibles: 0,
			entradaCombustibleFuenteRenovable: 0,
			entradaElectricidadFuenteRenovable: 0,
			entradaEnergiaAutogeneradaRenovable: 0,
		}
		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Entrada combustible carbón") {
				valores["entradaCombustibleCarbon"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible petroleo 2 (Diesel)") {
				valores["entradaCombustibleDiesel"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible petroleo 6") {
				valores["entradaCombustiblePetroleo"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible gas natural") {
				valores["entradaCombustibleGas"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible gas licuado petroleo (GLP)") {
				valores["entradaCombustibleGasLicuado"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible Gasolina") {
				valores["entradaCombustibleGasolina"] = inputDat.value;
			} else if (inputDat.name === "Entrada electricidad, calor, vapor, refrigeración") {
				valores["entradaElectricidad"] = inputDat.value;
			} else if (inputDat.name === "Entrada otros combustibles no renovables") {
				valores["entradaOtrosCombustibles"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible fuente renovables") {
				valores["entradaCombustibleFuenteRenovable"] = inputDat.value;
			} else if (inputDat.name === "Entrada electricidad fuente renovable") {
				valores["entradaElectricidadFuenteRenovable"] = inputDat.value;
			} else if (inputDat.name === "Entrada energía autogenerada renovable") {
				valores["entradaEnergiaAutogeneradaRenovable"] = inputDat.value;
			}
		})

		const numerador =
			valores["entradaCombustibleFuenteRenovable"] +
			valores["entradaElectricidadFuenteRenovable"] +
			valores["entradaEnergiaAutogeneradaRenovable"];

		const denominador =
			valores["entradaCombustibleCarbon"] +
			valores["entradaCombustibleDiesel"] +
			valores["entradaCombustiblePetroleo"] +
			valores["entradaCombustibleGas"] +
			valores["entradaCombustibleGasLicuado"] +
			valores["entradaCombustibleGasolina"] +
			valores["entradaElectricidad"] +
			valores["entradaOtrosCombustibles"];
		valores["entradaCombustibleFuenteRenovable"] +
			valores["entradaElectricidadFuenteRenovable"] +
			valores["entradaEnergiaAutogeneradaRenovable"];

		// Create an object with the names of the input dats and their values
		const details = {};
		inputDatsValues.forEach((inputDat) => {
			details[inputDat.name] = inputDat.value;
		});

		// Calculate division
		const result = numerador / denominador;

		return { result, details };

	} else if (name === "Consumo de energía") {
		const valores = {
			entradaCombustibleCarbon: 0,
			entradaCombustibleDiesel: 0,
			entradaCombustiblePetroleo: 0,
			entradaCombustibleGas: 0,
			entradaCombustibleGasLicuado: 0,
			entradaCombustibleGasolina: 0,
			entradaElectricidad: 0,
			entradaOtrosCombustibles: 0,
			entradaCombustibleFuenteRenovable: 0,
			entradaElectricidadFuenteRenovable: 0,
			entradaEnergiaAutogeneradaRenovable: 0,
		}
		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Entrada combustible carbón") {
				valores["entradaCombustibleCarbon"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible petroleo 2 (Diesel)") {
				valores["entradaCombustibleDiesel"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible petroleo 6") {
				valores["entradaCombustiblePetroleo"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible gas natural") {
				valores["entradaCombustibleGas"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible gas licuado petroleo (GLP)") {
				valores["entradaCombustibleGasLicuado"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible Gasolina") {
				valores["entradaCombustibleGasolina"] = inputDat.value;
			} else if (inputDat.name === "Entrada electricidad, calor, vapor, refrigeración") {
				valores["entradaElectricidad"] = inputDat.value;
			} else if (inputDat.name === "Entrada otros combustibles no renovables") {
				valores["entradaOtrosCombustibles"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible fuente renovables") {
				valores["entradaCombustibleFuenteRenovable"] = inputDat.value;
			} else if (inputDat.name === "Entrada electricidad fuente renovable") {
				valores["entradaElectricidadFuenteRenovable"] = inputDat.value;
			} else if (inputDat.name === "Entrada energía autogenerada renovable") {
				valores["entradaEnergiaAutogeneradaRenovable"] = inputDat.value;
			}
		})

		return (
			valores["entradaCombustibleCarbon"] +
			valores["entradaCombustibleDiesel"] +
			valores["entradaCombustiblePetroleo"] +
			valores["entradaCombustibleGas"] +
			valores["entradaCombustibleGasLicuado"] +
			valores["entradaCombustibleGasolina"] +
			valores["entradaElectricidad"] +
			valores["entradaOtrosCombustibles"] +
			valores["entradaCombustibleFuenteRenovable"] +
			valores["entradaElectricidadFuenteRenovable"] +
			valores["entradaEnergiaAutogeneradaRenovable"]
		);

	} else if (name === "Tasa de intensidad de energía") {
		const valores = {
			entradaCombustibleCarbon: 0,
			entradaCombustibleDiesel: 0,
			entradaCombustiblePetroleo: 0,
			entradaCombustibleGas: 0,
			entradaCombustibleGasLicuado: 0,
			entradaCombustibleGasolina: 0,
			entradaElectricidad: 0,
			entradaOtrosCombustibles: 0,
			entradaCombustibleFuenteRenovable: 0,
			entradaElectricidadFuenteRenovable: 0,
			entradaEnergiaAutogeneradaRenovable: 0,
			costosProveedoresLocales: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Entrada combustible carbón") {
				valores["entradaCombustibleCarbon"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible petroleo 2 (Diesel)") {
				valores["entradaCombustibleDiesel"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible petroleo 6") {
				valores["entradaCombustiblePetroleo"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible gas natural") {
				valores["entradaCombustibleGas"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible gas licuado petroleo (GLP)") {
				valores["entradaCombustibleGasLicuado"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible Gasolina") {
				valores["entradaCombustibleGasolina"] = inputDat.value;
			} else if (inputDat.name === "Entrada electricidad, calor, vapor, refrigeración") {
				valores["entradaElectricidad"] = inputDat.value;
			} else if (inputDat.name === "Entrada otros combustibles no renovables") {
				valores["entradaOtrosCombustibles"] = inputDat.value;
			} else if (inputDat.name === "Entrada combustible fuente renovables") {
				valores["entradaCombustibleFuenteRenovable"] = inputDat.value;
			} else if (inputDat.name === "Entrada electricidad fuente renovable") {
				valores["entradaElectricidadFuenteRenovable"] = inputDat.value;
			} else if (inputDat.name === "Entrada energía autogenerada renovable") {
				valores["entradaEnergiaAutogeneradaRenovable"] = inputDat.value;
			} else if (inputDat.name === "Costos gastados en proveedores locales") {
				valores["costosProveedoresLocales"] = inputDat.value;
			}
		})

		const numerador =
			valores["entradaCombustibleCarbon"] +
			valores["entradaCombustibleDiesel"] +
			valores["entradaCombustiblePetroleo"] +
			valores["entradaCombustibleGas"] +
			valores["entradaCombustibleGasLicuado"] +
			valores["entradaCombustibleGasolina"] +
			valores["entradaElectricidad"] +
			valores["entradaOtrosCombustibles"] +
			valores["entradaCombustibleFuenteRenovable"] +
			valores["entradaElectricidadFuenteRenovable"] +
			valores["entradaEnergiaAutogeneradaRenovable"];

		const denominador = valores["costosProveedoresLocales"];
		return numerador / denominador;
	} else if (name === "Porcentaje de circularidad entrada") {
		const valores = {
			entradaBiologicosRenovables: 0,
			entradaTecnicosNoVirgen: 0,
			entradaTotal: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Entrada de suministros biológicos renovables") {
				valores["entradaBiologicosRenovables"] = inputDat.value;
			}
			if (inputDat.name === "Entrada de suministros técnicos de material no virgen") {
				valores["entradaTecnicosNoVirgen"] = inputDat.value;
			}
			if (inputDat.name === "Entrada de suministros totales") {
				valores["entradaTotal"] = inputDat.value;
			}
		})

		const result = (valores["entradaBiologicosRenovables"] + valores["entradaTecnicosNoVirgen"]) / valores["entradaTotal"];

		const details = {};
		inputDatsValues.forEach((inputDat) => {
			details[inputDat.name] = inputDat.value;
		});

		return { result, details };

	} else if (name === "Proporción de gasto en proveedores locales") {
		const valores = {
			costosProveedoresLocales: 0,
			costosTotalesProveedores: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Costos gastados en proveedores locales") {
				valores["costosProveedoresLocales"] = inputDat.value;
			}
			if (inputDat.name === "Costos totales gastados en proveedores") {
				valores["costosTotalesProveedores"] = inputDat.value;
			}
		})

		const result = valores["costosProveedoresLocales"] / valores["costosTotalesProveedores"];

		return result;
	} else if (name === "Productividad circular de material") { /* Aquí irán los indicadores económicos */
		const valores = {
			ingresosTotales: 0,
			salidaResiduosMunicipales: 0,
			salidaIncineracionBiomasa: 0,
			salidaCoproceso: 0,
			salidaPeligrosos: 0,
			salidaInertes: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Ingresos totales") {
				valores["ingresosTotales"] = inputDat.value;
			}
			if (inputDat.name === "Salida residuos municipales") {
				valores["salidaResiduosMunicipales"] = inputDat.value;
			}
			if (inputDat.name === "Salida Incineración de biomasa") {
				valores["salidaIncineracionBiomasa"] = inputDat.value;
			}
			if (inputDat.name === "Salida coproceso") {
				valores["salidaCoproceso"] = inputDat.value;
			}
			if (inputDat.name === "Salida peligrosos") {
				valores["salidaPeligrosos"] = inputDat.value;
			}
			if (inputDat.name === "Salida inertes") {
				valores["salidaInertes"] = inputDat.value;
			}
		})

		const numerador = valores["ingresosTotales"];
		const denominador = valores["salidaResiduosMunicipales"] + valores["salidaIncineracionBiomasa"] + valores["salidaCoproceso"] + valores["salidaPeligrosos"] + valores["salidaInertes"];

		const result = numerador / denominador;

		return result;
	} else if (name === "Porcentaje de ingreso por acciones circulares") {
		const valores = {
			ingresoVentaSubproducto: 0,
			ingresoServicioCircularReciclaje: 0,
			ingresosTotales: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Ingreso por venta de subproducto") {
				valores["ingresoVentaSubproducto"] = inputDat.value;
			}
			if (inputDat.name === "Ingreso por servicio circular de reciclaje") {
				valores["ingresoServicioCircularReciclaje"] = inputDat.value;
			}
			if (inputDat.name === "Ingresos totales") {
				valores["ingresosTotales"] = inputDat.value;
			}
		})

		const result = (valores["ingresoVentaSubproducto"] + valores["ingresoServicioCircularReciclaje"]) / valores["ingresosTotales"];

		const details = {};
		inputDatsValues.forEach((inputDat) => {
			details[inputDat.name] = inputDat.value;
		});

		return { result, details };

	} else if (name === "Porcentaje inversión en circularidad") {
		const valores = {
			inversionCircularPersonal: 0,
			inversionCircularProyectos: 0,
			inversionTotal: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Inversión circular de personal") {
				valores["inversionCircularPersonal"] = inputDat.value;
			}
			if (inputDat.name === "Inversión circular de proyectos") {
				valores["inversionCircularProyectos"] = inputDat.value;
			}
			if (inputDat.name === "Inversión total") {
				valores["inversionTotal"] = inputDat.value;
			}
		})

		const result = (valores["inversionCircularPersonal"] + valores["inversionCircularProyectos"]) / valores["inversionTotal"];

		const details = {};
		inputDatsValues.forEach((inputDat) => {
			details[inputDat.name] = inputDat.value;
		});

		return { result, details };
	} else if (name === "Empleo verde (Número gránde)") {
		const valores = {
			empleosDirectos: 0,
			empleosIndirectosCreados: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Empleos directos") {
				valores["empleosDirectos"] = inputDat.value;
			}
			if (inputDat.name === "Empleos indirectos creados (contratistas)") {
				valores["empleosIndirectosCreados"] = inputDat.value;
			}
		})

		const result = valores["empleosDirectos"] + valores["empleosIndirectosCreados"];

		return result;
	} else if (name === "Educación ambiental interna (Número grande)") {
		const valores = {
			horasCharlasEC: 0,
			numeroAsistentesCharla: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Horas charlas de EC") {
				valores["horasCharlasEC"] = inputDat.value;
			}
			if (inputDat.name === "Número de asistentes a las charla") {
				valores["numeroAsistentesCharla"] = inputDat.value;
			}
		})

		const result = valores["horasCharlasEC"] / valores["numeroAsistentesCharla"];

		return result;
	} else if (name === "Porcentaje de participación femenina (torta)") {
		const valores = {
			empleadosTotales: 0,
			empleosMujeres: 0,
		}

		inputDatsValues.forEach((inputDat) => {
			if (inputDat.name === "Empleados totales") {
				valores["empleadosTotales"] = inputDat.value;
			}
			if (inputDat.name === "Empleos ocupados por mujeres") {
				valores["empleosMujeres"] = inputDat.value;
			}
		})

		const result = valores["empleosMujeres"] / valores["empleadosTotales"];

		return result;
	}
};

const monthNumberToName = (monthNumber) => {
	const monthNames = [
		"enero",
		"febrero",
		"marzo",
		"abril",
		"mayo",
		"junio",
		"julio",
		"agosto",
		"septiembre",
		"octubre",
		"noviembre",
		"diciembre",
	];
	return monthNames[monthNumber];
};

//Routes

export const getIndicators = async (req, res) => {
	try {
		if (req.params.branch) {
			const branch = await Branch.findById(req.params.branch);
			if (!branch)
				return res.status(400).send({ message: "Branch not found" });
			const indicators = await Indicator.find();
			if (!indicators)
				return res
					.status(400)
					.send({ message: "Indicators not found" });
			const branchIndicators = indicators.filter((indicator) =>
				indicator.inputDats.some((inputDat) =>
					branch.inputDats.includes(inputDat)
				)
			);
			return res.status(200).send({ indicators: branchIndicators });
		} else {
			const indicators = await Indicator.find();
			if (!indicators)
				return res
					.status(400)
					.send({ message: "Indicators not found" });
			return res.status(200).send({ indicators });
		}
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const getIndicatorInfo = async (req, res) => {
	try {
		const indicator = await Indicator.findById(req.params.indicator);
		if (!indicator)
			return res.status(400).send({ message: "Indicator not found" });
		// Each indicator contains a list of input dats IDS, we need to get the details of each input dat
		const inputDats = await ListInputDat.find({
			_id: { $in: indicator.inputDats },
		});
		if (!inputDats)
			return res.status(400).send({ message: "InputDats not found" });
		// Return only names of the input dats
		const inputDatsNames = inputDats.map((inputDat) => inputDat.name);
		return res.status(200).send({ indicator, inputDatsNames });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const getIndicatorValue = async (req, res) => {
	try {
		//Validate the data
		await Indicator.validateGetIndicatorValue(req.params);
		//Se obtendra todos los indicadores
		const branch = req.params.branch;
		const indicator = req.params.indicator;
		const currentIndicator = await Indicator.findById(indicator);
		if (!currentIndicator)
			return res.status(400).send({ message: "Indicator not found" });
		const branchExist = await Branch.findById(branch);
		if (!branchExist)
			return res.status(400).send({ message: "Branch not found" });

		//Create and array with the listInputDat indexes from the indicator
		const listInputDatsIndexes = currentIndicator.inputDats.map(
			(inputDat) => inputDat._id
		);

		const year = req.params.year;
		//Si no se indica el mes, se obtendra el valor del año
		let month = req.params.month;
		//Obtener los datos de entrada asociados al indicador
		if (!month) {
			//Obtener los valores de los input dats del año
			const monthValues = [];
			//Explorar cada mes del año
			for (let i = 1; i <= 12; i++) {
				//Definir rango de fechas
				const startDate = new Date(year, i - 1, 1, 0, 0, 0, 0);
				const endDate = new Date(year, i, 0, 23, 59, 59, 999);
				const monthName = monthNumberToName(i - 1);
				//*Se define como valor por defecto negativo, si no se encuentra el valor del indicador
				const monthValue = {
					month: monthName,
					indice: i,
					value: -1,
				};
				//Obtener los valores de los input dats usando el id del indicador y la sucursal
				let inputDatValues = await InputDat.aggregate([
					{
						$match: {
							date: {
								$gte: startDate,
								$lte: endDate,
							},
							branch: branchExist._id,
							listInputDat: { $in: listInputDatsIndexes },
						},
					},
					{
						$lookup: {
							from: "listinputdats",
							localField: "listInputDat",
							foreignField: "_id",
							as: "listInputDatDetails",
						},
					},
					{
						$unwind: {
							path: "$listInputDatDetails",
							preserveNullAndEmptyArrays: true, // Conservar los documentos incluso si no hay correspondencia en el lookup.
						},
					},
					{
						$addFields: {
							name: "$listInputDatDetails.name",
						},
					},
					{
						$project: {
							listInputDatDetails: 0,
						},
					},
				]);
				console.log(
					"🚀 ~ getIndicatorValue ~ inputDatValues:",
					inputDatValues
				);
				//Si no se encuentran valores, se retorna el valor por defecto
				if (inputDatValues.length === 0) {
					monthValues.push(monthValue);
					continue;
				} else {
					const value = getValue(
						currentIndicator.name,
						inputDatValues
					);
					console.log(
						"🚀 ~ getIndicatorValue ~ value:",
						value
					);
					// Si value es del tipo {} se obtiene el valor y los detalles
					if (typeof value === "object") {
						monthValue.value = value.result;
						monthValue.details = value.details;
					} else {
						// Si value es un número se obtiene el valor
						monthValue.value = value;
					}
					monthValues.push(monthValue);
				}
			}
			console.log(
				"🚀 ~ getIndicatorValue ~ monthValues:",
				monthValues
			);
			return res.status(200).send({ monthValues });
		} else {
			month = parseInt(month);
			//Obtener los valores de los input dats del mes
			//Definir rango de fechas
			const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
			const endDate = new Date(year, month, 0, 23, 59, 59, 999);
			//Obtener los valores de los input dats
			const inputDatsValues = await InputDat.aggregate([
				{
					$match: {
						listInputDat: { $in: listInputDatsIndexes },
						date: {
							$gte: startDate,
							$lte: endDate,
						},
						branch: branchExist._id,
					},
				},
				{
					$lookup: {
						from: "listinputdats",
						localField: "listInputDat",
						foreignField: "_id",
						as: "listInputDatDetails",
					},
				},
				{
					$unwind: {
						path: "$listInputDatDetails",
						preserveNullAndEmptyArrays: true, // Conservar los documentos incluso si no hay correspondencia en el lookup.
					},
				},
				{
					$addFields: {
						name: "$listInputDatDetails.name",
					},
				},
				{
					$project: {
						listInputDatDetails: 0,
					},
				},
			]);
			//Obtener valor
			if (inputDatsValues.length === 0) {
				return res.status(200).send({ value: -1 });
			} else {
				const value = getValue(currentIndicator.name, inputDatsValues);
				return res.status(200).send({ value });
			}
		}
	} catch (error) {
		if (error.isJoi)
			return res.status(400).send({ message: error.details[0].message });
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const registerIndicator = async (req, res) => {
	//Validate the data
	try {
		await Indicator.validateIndicators(req.body);
		const {
			name,
			source,
			category,
			sourceType,
			description,
			measurement,
			inputDats,
		} = req.body;
		//Have to check if the indicator exist
		const indicatorExist = await Indicator.findOne({ name: name });
		if (indicatorExist)
			return res.status(400).send({ message: "Indicator already exist" });

		//Have to verify the reference of the input dats if they exist
		if (inputDats) {
			for (const inputDat of inputDats) {
				const inputDatExist = await ListInputDat.findById(inputDat);
				if (!inputDatExist)
					return res
						.status(400)
						.send({ message: "InputDat not found" });
			}
		}
		const newIndicator = new Indicator({
			_id: new Types.ObjectId(),
			name,
			source,
			category,
			sourceType,
			description,
			measurement,
			inputDats,
		});
		const result = await newIndicator.save();
		if (!result)
			return res
				.status(400)
				.send({ message: "Failed to register indicator" });
		return res.status(200).send({ message: "Indicator registered" });
	} catch (error) {
		console.log("error", error);
		if (error.name === "ValidationError") {
			return res.status(400).send({ message: error.message });
		}
		res.status(500).send({ message: "Internal Server Error" });
	}
};

export const updateIndicator = async (req, res) => {
	try {
		//Validate the data
		await Indicator.validateUpdateIndicators(req.body);
		const {
			name,
			source,
			category,
			sourceType,
			description,
			measurement,
			inputDats,
			factors,
		} = req.body;
		//Have to check if the indicator exist
		const indicatorExist = await Indicator.findById(req.params.id);
		if (!indicatorExist)
			return res.status(400).send({ message: "Indicator not found" });
		//Verificar si tiene la estructura requerida solo en caso si se recibe un dato de entrada
		if (inputDats) {
			for (const inputDat of inputDats) {
				await InputDat.validateFirstInputDat(inputDat);
			}
		}
		const result = await Indicator.findByIdAndUpdate(req.params.id, {
			...req.body,
		});
		if (!result)
			return res
				.status(400)
				.send({ message: "Failed to update indicator" });
		return res.status(200).send({ message: "Indicator updated" });
	} catch (error) {
		console.log("error", error);
		if (error.isJoi)
			return res.status(400).send({ message: error.details[0].message });
		res.status(500).send({ message: "Internal Server Error" });
	}
};
