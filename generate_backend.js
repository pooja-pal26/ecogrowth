const fs = require('fs');
const path = require('path');

const modules = [
  { name: 'Invoice', modelName: 'Invoice', routeName: 'invoices', fields: 'invoiceNumber: String, amount: Number, status: { type: String, default: "Pending" }, clientId: { type: mongoose.Schema.Types.ObjectId, ref: "ClientMaster" }, poId: { type: mongoose.Schema.Types.ObjectId, ref: "PoSite" }' },
  { name: 'Asset', modelName: 'Asset', routeName: 'assets', fields: 'assetName: String, assetType: String, serialNumber: String, status: { type: String, default: "Active" }' },
  { name: 'Vendor', modelName: 'Vendor', routeName: 'vendors', fields: 'vendorName: String, contactPerson: String, contactNumber: String, email: String, status: { type: String, default: "Active" }' },
  { name: 'Material', modelName: 'Material', routeName: 'materials', fields: 'materialName: String, quantity: Number, unit: String, status: { type: String, default: "Available" }' },
];

const serverPath = path.join(__dirname, 'server');

modules.forEach(mod => {
  // 1. Create Model
  const modelContent = `const mongoose = require('mongoose');\n\nconst ${mod.name.toLowerCase()}Schema = new mongoose.Schema({\n  ${mod.fields}\n}, { timestamps: true });\n\nmodule.exports = mongoose.model('${mod.modelName}', ${mod.name.toLowerCase()}Schema);`;
  fs.writeFileSync(path.join(serverPath, 'models', `${mod.modelName}.js`), modelContent);

  // 2. Create Controller
  const controllerContent = `const ${mod.modelName} = require('../models/${mod.modelName}');\n\nexports.getAll = async (req, res) => {\n  try {\n    const data = await ${mod.modelName}.find().sort({ createdAt: -1 });\n    res.status(200).json({ success: true, data });\n  } catch (error) {\n    res.status(500).json({ success: false, message: error.message });\n  }\n};\n\nexports.create = async (req, res) => {\n  try {\n    const newData = new ${mod.modelName}(req.body);\n    await newData.save();\n    res.status(201).json({ success: true, data: newData });\n  } catch (error) {\n    res.status(500).json({ success: false, message: error.message });\n  }\n};\n\nexports.update = async (req, res) => {\n  try {\n    const updatedData = await ${mod.modelName}.findByIdAndUpdate(req.params.id, req.body, { new: true });\n    res.status(200).json({ success: true, data: updatedData });\n  } catch (error) {\n    res.status(500).json({ success: false, message: error.message });\n  }\n};\n\nexports.delete = async (req, res) => {\n  try {\n    await ${mod.modelName}.findByIdAndDelete(req.params.id);\n    res.status(200).json({ success: true, message: 'Deleted successfully' });\n  } catch (error) {\n    res.status(500).json({ success: false, message: error.message });\n  }\n};`;
  fs.writeFileSync(path.join(serverPath, 'controllers', `${mod.name.toLowerCase()}Controller.js`), controllerContent);

  // 3. Create Route
  const routeContent = `const express = require('express');\nconst router = express.Router();\nconst controller = require('../controllers/${mod.name.toLowerCase()}Controller');\n\nrouter.get('/', controller.getAll);\nrouter.post('/', controller.create);\nrouter.put('/:id', controller.update);\nrouter.delete('/:id', controller.delete);\n\nmodule.exports = router;`;
  fs.writeFileSync(path.join(serverPath, 'routes', `${mod.name.toLowerCase()}Routes.js`), routeContent);
});

// 4. Update index.js
const indexJsPath = path.join(serverPath, 'index.js');
let indexJsContent = fs.readFileSync(indexJsPath, 'utf8');

const routesRequires = modules.map(mod => `const ${mod.name.toLowerCase()}Routes = require('./routes/${mod.name.toLowerCase()}Routes');`).join('\n');
const appUses = modules.map(mod => `app.use('/api/${mod.routeName}', ${mod.name.toLowerCase()}Routes);`).join('\n');

indexJsContent = indexJsContent.replace("const dashboardRoutes = require('./routes/dashboardRoutes');", `const dashboardRoutes = require('./routes/dashboardRoutes');\n${routesRequires}`);
indexJsContent = indexJsContent.replace("app.use('/api/master-data', require('./routes/masterDataRoutes'));", `app.use('/api/master-data', require('./routes/masterDataRoutes'));\n${appUses}`);

fs.writeFileSync(indexJsPath, indexJsContent);

console.log('Backend modules generated and index.js updated.');
