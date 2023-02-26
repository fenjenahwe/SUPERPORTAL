run
npm i in server folder to install node_modules

run
npm run serve

set rooms_list via redis-cli to the following
"[{\"name\":\"Pirate\",\"url\":\"./images/pirate_island.png\",\"welcome_msg\":\"This is Pirates' Bay. They say curiosity killed the cat. Don't get too wise, you might not get away with it!\",\"id\":0,\"online_num\":0,\"weather\":\"snow\",\"default\":true,\"people\":[],\"range\":[-700,700],\"exits\":{\"Beach\":[-30,-60]},\"leadsTo\":[\"Beach\"]},{\"name\":\"Beach\",\"url\":\"./images/beach_night.png\",\"welcome_msg\":\"You've made it to the Beach. If you're hungry, help yourself to an apple. Don't forget to sit back and stargaze. I hear the edge of the rock is a comfy spot.\",\"id\":1,\"default\":false,\"online_num\":0,\"weather\":\"rain\",\"people\":[],\"range\":[-700,700],\"exits\":{\"Pirate\":[-290,90]},\"objects\":{\"tree\":{\"coordinates\":[-218,-39,-277,-43,-244,-145],\"centroid\":[-246,-76],\"size\":\"big\",\"reactionFacing\":3,\"reactionGait\":\"jumping\",\"reactionAction\":\"none\"},\"rock\":{\"coordinates\":[162,10,172,10],\"centroid\":[167,10],\"size\":\"small\",\"reactionFacing\":2,\"reactionGait\":\"idle\",\"reactionAction\":\"sit\"}},\"leadsTo\":[\"Pirate\"]}]"

New users automatically create a new user/pwd if the username does not already exist. If it does, a prompt asks the user to provide the correct password to the corresponding username or to sign up with a different username.

New users are logged into a default room, The Pirate's Bay. They are greeted with a welcome message. From this room, another predefined room exists already and is accessible via the rope ladder. In the second room, users can interact with the environment by picking an apple or sitting on the rock. They can return to The Pirate's Bay. In both rooms, some obvious exits seem restricted at a first glance. These exits become available when a user creates a new room and automatically expands the map to all users of this app. The exit which leads to the new room created is mentioned by a system message when a new room is created. 

The weather can be changed personally for each user – it's not synchronized.
