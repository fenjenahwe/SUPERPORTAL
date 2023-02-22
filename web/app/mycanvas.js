var MyCanvas = {
  mouse_pos: [0, 0],
  current_room: null,
  clickableCanvas: null,
  init: async function () {
    this.my_user = MyChat.my_user;
    this.clickableCanvas = document.querySelector("#Universe");
    this.clickableCanvas.addEventListener("mousedown", this.onMouse.bind(this));
    this.clickableCanvas.addEventListener("mousemove", this.onMouse.bind(this));
    this.clickableCanvas.addEventListener("mouseup", this.onMouse.bind(this));
    document.body.addEventListener("keydown", this.onKey.bind(this));
    document.body.addEventListener("keyup", this.onKey.bind(this));
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    View.init(this.canvas, this.ctx);
  },

  draw: function () {
    document.querySelector("#gallery").style.display = "none"
    View.draw(this.current_room);
  },
  drawGallery: function() {
    document.querySelector("#gallery").style.display = "block"
    View.drawGallery();
  },

  OnUserSpeak: function (msg) {
    this.my_user.action = "talking";
  },

  onMouse: function (e) {
    if (e.type == "mousedown") {
      var rect = this.canvas.getBoundingClientRect();
      this.mouse_pos[0] = e.clientX - rect.left;
      this.mouse_pos[1] = e.clientY - rect.top;
      var localmouse = View.canvasToWorld(this.mouse_pos);
      this.my_user.target[0] = localmouse[0];
      this.my_user.target[1] = localmouse[1];
      this.current_room.people.forEach((user) => {
        if (user.username == this.my_user.username) {
          user.target = this.my_user.target;
        }
      });
      console.log(this.my_user.target);
      room_name = this.current_room.name;
      data = {
        type: "state",
        content: this.current_room,
      };
      MyChat.server.send(JSON.stringify(data));
    }
  },

  onKey: function (e) {
    if (e.key == "Control") {
      if (this.my_user.action == "crouchdown") this.my_user.action = "none";
      else this.my_user.action = "crouchdown";
    }
  },
};

function loop() {
  if (MyCanvas.current_room) {
    MyCanvas.draw();
  } else MyCanvas.drawGallery();
  requestAnimationFrame(loop);
}

loop();
