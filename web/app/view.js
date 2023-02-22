var LOOPS = 0;
var imgs = {};
var View = {
  canvas: null,
  ctx: null,
  cam_offset: 0,
  scale: 2,
  particles: [],
  angle: 0,
  weather: "snow",
  message_bubble: [],

  init: function (canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    if (this.canvas.getContext) {
      this.canvas_w = this.canvas.parentNode.getBoundingClientRect().width;
      this.canvas_h = this.canvas.parentNode.getBoundingClientRect().height;
    }
    this.initWeather();
  },

  gait_animations: {
    idle: [0],
    walking: [2, 3, 4, 5, 6, 7, 8, 9],
    jumping: [0, 11, 12, 11, 0],
  },

  action_animations: {
    talking: [0, 1],
    crouchdown: [11],
    none: [0],
    sit: [13],
  },

  drawGallery: function () {
    var gallery = document.querySelector("#gallery");
    var ctx = gallery.getContext("2d");
    var parent = gallery.parentNode;
    var rect = parent.getBoundingClientRect();
    gallery.width = 400;
    gallery.height = 100;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, gallery.width, gallery.height);
    ctx.save();

    ctx.translate(gallery.width / 2, gallery.height / 2); // now the (0,0) is in the center of the canvas
    ctx.scale(1.7, 1.7);
    for (i = 1; i <= 6; i++) {
      _x = -76 + (i - 1) * 30;
      var user = new User({
        id: 1,
        gait: "walking",
        position: _x,
        avatar: STATIC_RESOURCE_ROOT + "character" + i + ".png",
      });
      View.drawUser(user, ctx);
    }
  },

  draw: function (current_room) {
    var parent = this.canvas.parentNode;
    var rect = parent.getBoundingClientRect();
    this.canvas.width = rect.width - 400;
    this.canvas.height = 0.97 * rect.height;
    this.ctx.imageSmoothingEnabled = false;
    for (user in current_room.people)
      if (MyCanvas.my_user.username == current_room.people[user].username)
        this.cam_offset = lerp(
          this.cam_offset,
          -current_room.people[user].position,
          0.025
        );
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); // now the (0,0) is in the center of the canvas
    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(this.cam_offset, 0);

    if (current_room) this.drawRoom(current_room);

    //center point
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(-1, -1, 2, 2);
    this.ctx.restore();

    // set snow and rain drop
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    if (this.weather == "rain") {
      this.rain();
    } else if (this.weather == "snow") {
      this.snow();
    }
  },

  initWeather: function (button) {
    if (typeof button != "undefined")
      if (button.innerHTML == "weather toggle") {
        this.weather = "snow";
        button.innerHTML = "snow";
      } else if (button.innerHTML == "snow") {
        button.innerHTML = "rain";
        this.weather = "rain";
      } else if (button.innerHTML == "rain") {
        button.innerHTML = "sunny";
        this.weather = "sunny";
      } else if (button.innerHTML == "sunny") {
        button.innerHTML = "snow";
        this.weather = "snow";
      }
    if (this.weather == "snow") var maxParts = 50;
    else if (this.weather == "rain") {
      var maxParts = 100;
    }
    if (this.weather != "sunny")
      for (var a = 0; a < maxParts; a++) {
        this.particles.push({
          x: Math.random() * this.canvas_w,
          y: Math.random() * this.canvas_h,
          l: Math.random() * 1,
          xs: -4 + Math.random() * 4 + 2,
          ys: Math.random() * 10 + 10,
          r: Math.random() * 4 + 1, //radius
          d: Math.random() * maxParts, //density
        });
      }
  },

  drawRoom: function (current_room) {
    //draw background
    img = this.getImage(current_room.url);
    this.ctx.drawImage(img, -img.width / 2, -img.height / 2);
    //draw exits
    this.drawExits(current_room);
    //draw users
    for (var i = 0; i < current_room.people.length; ++i) {
      var user = current_room.people[i];
      this.drawUser(user, this.ctx);
      this.drawUsername(user);
      this.drawBubble(user);
    }
    // draw bubbles
    //draw target
    this.drawTarget();
    //draw interactive objects
    this.drawObjects(current_room);
  },

  drawExits: function (current_room) {
    // this.ctx.fillStyle = "red";
    // for (val in current_room.exits) {
    //   var exits = current_room.exits[val];
    //   this.ctx.fillRect(exits[0], exits[1], 5, 5);
    // }
    for (template_name in Model.ROOMS) {
      if (
        Model.ROOMS[template_name].exits_coordinate[0].toString() ==
        Object.values(current_room.exits)[0].toString()
      ) {
        var exits_coordinate = Model.ROOMS[template_name].exits_coordinate;
        var exits_offset = Model.ROOMS[template_name].exits_offset
        if (current_room.leadsTo.length != 2) {
          portal_image = this.getImage(
            STATIC_RESOURCE_ROOT + "blocked-exit.png"
          );
          this.ctx.drawImage(
            portal_image,
            200,
            200,
            250,
            250,
            exits_coordinate[1][0] - exits_offset[1][0],
            exits_coordinate[1][1] - exits_offset[1][1],
            200,
            200
          );
        }
      }
    }
  },

  drawObjects: function (current_room) {
    if (current_room.objects) {
      Object.values(current_room.objects).forEach((val) => {
        centroid = val.centroid;
        size = val.size;
        switch (size) {
          case "small":
            size = 10;
            break;
          case "medium":
            size = 25;
            break;
          case "big":
            size = 50;
            break;
        }
        this.ctx.beginPath();
        this.ctx.arc(centroid[0], centroid[1], size, 0, 2 * Math.PI);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "pink";
        this.ctx.stroke();
        this.ctx.closePath();
        // if (INTERACTION == true) {
        //   console.log("WELL DONE!");
        //   this.ctx.font = "10px Helvetica";
        //   this.ctx.fillText("WELL DONE!", centroid[0], centroid[1]);
        // }
      });
    }
  },

  drawTarget: function () {
    radius = 2;
    this.ctx.beginPath();
    if (!MyCanvas.my_user) {
      user = {};
      user.target = [0, 0];
    } else user = MyCanvas.my_user;

    this.ctx.arc(user.target[0], user.target[1], radius, 2 * Math.PI, false);
    //console.log("target coordinates" + user.target);
    this.ctx.fillStyle = "yellow";
    this.ctx.fill();
  },

  drawBubble: function (user) {
    if (this.message_bubble.length == 0) return;
    for (ind = this.message_bubble.length - 1; ind > 0; ind--) {
      if (this.message_bubble[ind].dur != 0) {
        if (user.username == this.message_bubble[ind].username) {
          ele = this.message_bubble[ind];
          x = user.position;
          let y = -50;
          //thoughts: we should limit number of characters in user's input to limit the size of the bubble.
          text = ele.content;
          username = ele.username;
          ele.dur--;
          for (i = 0; i < this.message_bubble.length; i++) {
            if (
              this.message_bubble[i] != ele &&
              this.message_bubble[i].username == ele.username
            )
              this.message_bubble[i].dur = 0;
          }
          // console.log("msg received for render: " + text + username);
          w =
            //this.ctx.measureText(username).width +
            this.ctx.measureText(text).width + 10;

          h = 15;
          radius = 5;
          // console.log("begin y at " + y + "x at " + x);
          var r = x + w;
          var b = y + h;

          //draw bubble
          this.ctx.beginPath();
          // console.log("begin bubble drawing");
          this.ctx.font = "7px Helvetica";
          this.ctx.strokeStyle = "black";
          this.ctx.lineWidth = "1";
          this.ctx.moveTo(x + radius, y);
          this.ctx.lineTo(r - radius, y);
          this.ctx.quadraticCurveTo(r, y, r, y + radius);
          this.ctx.lineTo(r, y + h - radius);
          this.ctx.quadraticCurveTo(r, b, r - radius, b);
          this.ctx.lineTo(x + radius, b);
          this.ctx.quadraticCurveTo(x, b, x, b - radius);
          this.ctx.lineTo(x, y + radius);
          this.ctx.quadraticCurveTo(x, y, x + radius, y);
          this.ctx.fillStyle = "white";
          this.ctx.fill();
          this.ctx.stroke();
          this.ctx.fillStyle = "black";
          this.ctx.fillText(text, x + 5, y + 10);
          // this.ctx.fillText(username + ": " + text, x + 10, y + 10);
          // console.log("end bubble drawing");
        }
      } else {
        this.message_bubble.splice(ind, 1);
      }
    }
  },

  drawUser: function (user, ctx) {
    if (!user.avatar) return;
    var gait_anim = this.gait_animations[user.gait];
    var action_anim = this.action_animations[user.action];
    if (!gait_anim) return;
    if (!action_anim) return;
    var time = performance.now() * 0.001;
    var img = this.getImage(user.avatar);
    var gait_frame = gait_anim[Math.floor(time * 10) % gait_anim.length];
    var action_frame = action_anim[Math.floor(time * 10) % action_anim.length];
    var facing = user.facing;

    if (user.action == "talking" && user.gait == "idle") {
      ctx.drawImage(
        img,
        action_frame * 32,
        facing * 64,
        32,
        64,
        user.position - 16,
        -28,
        32,
        64
      );
    } else if (user.action == "crouchdown" || user.action == "sit") {
      ctx.drawImage(
        img,
        action_frame * 32,
        facing * 64,
        32,
        64,
        user.position - 16,
        -28,
        32,
        64
      );
      if (user.gait == "walking") user.action = "none";
      INTERACTION = false;
    }

    //implementing jumping as 2 loops
    else if (user.gait == "jumping") {
      ctx.drawImage(
        img,
        gait_frame * 32,
        facing * 64,
        32,
        64,
        user.position - 16,
        -28,
        32,
        64
      );
      console.log("drawing frame " + gait_frame);

      if (Math.floor(time * 10) % gait_anim.length == 4) LOOPS += 1;

      if (LOOPS > 40) {
        user.gait = "idle";
        console.log("view just flipped gait to " + user.gait);
        if (INTERACTION == true) INTERACTION = false;
        LOOPS = 0;
      }

      // this.drawBubble(user.position, -50, msg);
    } else if (user.action == "talking" && user.gait == "walking")
      ctx.drawImage(
        img,
        gait_frame * 32,
        facing * 64,
        32,
        64,
        user.position - 16,
        -28,
        32,
        64
      );
    // remove talking and return talking onUserArrive
    else if (user.gait) {
      ctx.drawImage(
        img,
        gait_frame * 32,
        facing * 64,
        32,
        64,
        user.position - 16,
        -28,
        32,
        64
      );
      //this.drawBubble(user.position, -50, msg);
      //ctx.font = "6px Helvetica";
      //ctx.fillText(user.name, user.position - 10, 50);
    }
  },

  drawUsername: function (user) {
    let y = 50;
    username = user.username;
    w = this.ctx.measureText(username).width;
    h = 15;
    radius = 5;
    x = user.position - w / 2;
    var r = x + w;
    var b = y + h;

    this.ctx.font = "7px Helvetica";
    this.ctx.fillText(username, x, y);
  },

  canvasToWorld: function (pos) {
    return [
      (pos[0] - this.canvas.width / 2) / this.scale - this.cam_offset,
      (pos[1] - this.canvas.height / 2) / this.scale,
    ];
  },

  worldToCanvas: function (pos) {
    return [
      (pos[0] + this.canvas.width / 2) * this.scale + this.cam_offset,
      (pos[1] + this.canvas.height / 2) * this.scale,
    ];
  },

  getImage: function (url) {
    if (imgs[url]) return imgs[url];
    var img = (imgs[url] = new Image());
    img.src = url;
    return img;
  },

  rain: function () {
    for (var c = 0; c < this.particles.length; c++) {
      var p = this.particles[c];
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
      this.ctx.stroke();
    }
    for (var b = 0; b < this.particles.length; b++) {
      var p = this.particles[b];
      p.x += p.xs;
      p.y += p.ys;

      if (p.x > this.canvas_w || p.y > this.canvas_h) {
        p.x = Math.random() * this.canvas_w;
        p.y = -20;
      }
    }
  },

  snow: function () {
    this.ctx.beginPath();
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      this.ctx.moveTo(p.x, p.y);
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
    }
    this.ctx.fill();
    this.angle += 0.01;
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      p.y += Math.cos(this.angle + p.d) + 1 + p.r / 2;
      p.x += Math.sin(this.angle) * 2;
      if (p.x > this.canvas_w + 5 || p.x < -5 || p.y > this.canvas_h) {
        if (i % 3 > 0) {
          this.particles[i] = {
            x: Math.random() * this.canvas_w,
            y: -10,
            r: p.r,
            d: p.d,
          };
        } else {
          if (Math.sin(this.angle) > 0) {
            this.particles[i] = {
              x: -5,
              y: Math.random() * this.canvas_h,
              r: p.r,
              d: p.d,
            };
          } else {
            this.particles[i] = {
              x: this.canvas_w + 5,
              y: Math.random() * this.canvas_h,
              r: p.r,
              d: p.d,
            };
          }
        }
      }
    }
  },

  showText: function (msg, style) {
    var elem = document.createElement("div");
    elem.className = style;
    var div = document.createElement("div");
    div.className = "username";
    time = msg.timestamp;
    div.innerHTML = msg.username + " " + time;
    if (msg.type === "sysmsg") {
      div.style.display = "none";
    }
    elem.appendChild(div);
    let div2 = document.createElement("div");
    div2.className = "publishedmsg";
    div2.classList.add(msg.type);
    div2.innerHTML = msg.content;
    elem.appendChild(div2);
    if (div2.innerHTML.trim() == "") {
      return;
    } else {
      var conversation = document.querySelector("#conversation");
      conversation.appendChild(elem);
      const lastdiv = document.querySelector(
        "#conversation > div:last-of-type"
      );
      lastdiv.scrollIntoView();
    }
  },

  showForm: function () {
    document.querySelector(".createRoomForm").style.display == "none"
      ? (document.querySelector(".createRoomForm").style.display = "block")
      : (document.querySelector(".createRoomForm").style.display = "none");
  },

  changeRoomName: function (text) {
    var title = document.querySelector("#roomName");
    title.innerHTML = text;
  },
};
