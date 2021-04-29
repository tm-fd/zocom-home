const { app } = require("./core");
const { db, update } = require("./db");
const Joi = require("joi");

app.listen(3000, () => {
  console.log("API for smart home 1.1 up n running.");
});

/* CODE YOUR API HERE */

let state = false;

const controlDevice = (id) => {
   state = !state;
   let device = db.get("devices").find({ id: id }).assign({on : state}).value();
   update()
   return device
};

const controlLock = () => {
  state = !state;
  let lock = db.get("devices").find({ id: 'LOC1' }).assign({locked : state}).value();
  update()
  return lock
};

app.get("/:type/:id/switch", (req, res) => {
  
  let updatedDevice = req.params.type === 'Lock' ? controlLock() : controlDevice(req.params.id);

  if (!updatedDevice || req.params.type !== updatedDevice.type) res.status(400).send("the device not found");

  state ? res.send(` ${updatedDevice.type} is on`) : res.send(` ${updatedDevice.type} is off`);
  
});



// You can also control the devices by input the wished value
app.put("/:type/:id", (req, res) => {

  let updatedDevice = db.get("devices").find({ id: req.params.id }).value();
  

  if (!updatedDevice || req.params.type !== updatedDevice.type) res.status(400).send("the device not found");

// Validating user input 
  const { error } = validateInput(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // All devices except the Lock  
  updatedDevice.on = req.body.on;
  // for the lights
  updatedDevice.brightness = req.body.brightness;
  updatedDevice.color = req.body.color;
  // for the door lock
  updatedDevice.locked = req.body.locked;

  update()

  res.send(updatedDevice);
});

// Validating function using Joi validation module
function validateInput(device) {
  const schema = Joi.object({
    on: Joi.boolean(),
    brightness: Joi.number(),
    color: Joi.string().min(4),
    locked: Joi.boolean(),
  });
  return schema.validate(device);
}

