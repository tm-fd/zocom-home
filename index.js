const { app } = require("./core");
const { db, update } = require("./db");
const Joi = require("joi");

app.listen(3000, () => {
  console.log("API for smart home 1.1 up n running.");
});

/* CODE YOUR API HERE */

const controlDevice = (id) => {
  const device = db.get("devices").find({ id: id }).value();
  return device;
};

app.get("/devices", (req, res) => {
  res.send(db);
});

app.get("/devices/:type/:id/switch", (req, res) => {
  let updatedDevice = controlDevice(req.params.id);

  if (req.params.type !== "Lock" && req.params.type === updatedDevice.type) {
    updatedDevice.on = !updatedDevice.on;

    if (updatedDevice.on === true) {
      res.send(` ${updatedDevice.type} is on`);
    } else {
      res.send(` ${updatedDevice.type} is off`);
    }
  } else {
    updatedDevice.locked = !updatedDevice.locked;

    if (updatedDevice.locked === true) {
      res.send(` ${updatedDevice.type} is on`);
    } else {
      res.send(` ${updatedDevice.type} is off`);
    }
  }
});


// You can also control the devices by input the wished value
app.put("/devices/:id", (req, res) => {
  let updatedDevice = controlDevice(req.params.id);

  if (!updatedDevice) res.status(400).send("the device not found");

// Validaring user input 
  const { error } = validateInput(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // All devices except the Lock  
  updatedDevice.on = req.body.on;
  // for the lights
  updatedDevice.brightness = req.body.brightness;
  updatedDevice.color = req.body.color;
  // for the door lock
  updatedDevice.locked = req.body.locked;

  res.send(updatedDevice);
});

function validateInput(device) {
  // "npm i joi" install joi validation
  const schema = Joi.object({
    on: Joi.boolean(),
    brightness: Joi.number(),
    color: Joi.string().min(4),
    locked: Joi.boolean(),
  });
  return schema.validate(device);
}
