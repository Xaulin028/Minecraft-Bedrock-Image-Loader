# Minecraft-Bedrock-Image-Loader
An addon together with a python api, to load images inside a Minecraft Bedrock map
# Addon to load images inside minecraft bedrock 1.20.73+

# Update:
* More colors added
* Commands
* Loading images via link

# How it works?
* The addon works using the @minecraft/server-net module, making a request to an api made using python that converts the image sent into a json string with the color of each pixel, returning this json to minecraft which then converts each color to its respective block and arrows the block using a base coordinate along with the x and y coordinate of each pixel

Demo video: https://youtu.be/y0-PZ_znmag
