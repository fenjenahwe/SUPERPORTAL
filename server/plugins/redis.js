const redis = require("redis");
const client = redis.createClient();

client.on("error", function (error) {
  console.error(chalk.red(error));
});
client.connect();
async function set(key, value, concat = false) {
  if (typeof value === "object" && !concat) {
    value = JSON.stringify(value);
  } else if (value === undefined) {
    console.log("value undefined");
    return;
  }
  if (concat) {
    let list = JSON.parse(await client.get(key)) || [];
    list.unshift(value);
    await client.set(key, JSON.stringify(list));
  } else {
    await client.set(key, value);
  }
}

async function get(key) {
  let value = await client.get(key);
  if (typeof value === "string") {
    value = JSON.parse(value);
  }
  return value;
}

async function update_user(name, value) {
  // update the user when log out
  let list = await get("user_list");
  if (typeof list == "undefined" || !list) return;
  if (list.length != undefined)
    for (i = 0; i < list.length; i++) {
      if (list[i].username == name) {
        list[i].position = value.position;
        list[i].room = value.room;
        list[i].target = [value.position, 0];
        break;
      }
    }
  await set("user_list", list);
}

module.exports = {
  get,
  set,
  update_user,
};
