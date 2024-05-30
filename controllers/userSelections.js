import UserSelection from '../models/UserSelection.js';

export const saveSelections = async (req, res) => {
    const { userId } = req.params;
    const { selections } = req.body;

    // Convertir el objeto de selecciones a un formato compatible con Map en Mongoose
    const formattedSelections = {};
    Object.keys(selections).forEach(category => {
        formattedSelections[category] = new Map(Object.entries(selections[category]));
    });

    try {
        const updatedSelections = await UserSelection.findOneAndUpdate(
            { userId },
            { $set: { selections: formattedSelections } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(updatedSelections);
    } catch (error) {
        console.error("Error saving selections:", error);
        res.status(500).send(error);
    }
};


export const getSelections = async (req, res) => {
    const { userId } = req.params;

    try {
        const selections = await UserSelection.findOne({ userId });
        if (!selections) {
            // Si no hay selecciones, crea un documento vacío y lo devuelve
            const newUserSelections = new UserSelection({ userId, selections: new Map() });
            await newUserSelections.save();
            res.json(newUserSelections);
            return;
        }
        // Convertir Map a objeto para facilitar el manejo en el cliente
        const selectionsObject = {};
        selections.selections.forEach((value, key) => {
            selectionsObject[key] = Object.fromEntries(value);
        });
        res.json({ ...selections.toObject(), selections: selectionsObject });
    } catch (error) {
        console.error("Error retrieving selections:", error);
        res.status(500).send(error);
    }
};
