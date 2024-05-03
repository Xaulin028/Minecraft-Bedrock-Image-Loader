from flask import Flask, request, jsonify
import base64
import requests
from PIL import Image
from io import BytesIO

app = Flask(__name__)

pure_colors = [
    "000000", "ffffff", "ff0000", "00ff00", "0000ff", "ffff00", "00ffff", "ff00ff", 
    "ffa502", "ffc800", "9801ff", "9b9b9b", "663300", "ffff66", "ff006b", "ff99cc", 
    "ffe5cc", "c6a2a2", "33363b", "6a696f", "9f5845", "33701a", "493a5a", "030f5d", 
    "e3dbb0", "a1a7b1", "a472a3", "4d494d", "65f5e3", "a04d4e", "440507", "8f503f", 
    "bda510", "b8945f", "919191", "997140", "945d41", "941400", "167e86", "966c4a", 
    "5f9033", "6a4418", "6a656a", "a97764", "9f6b58", "8a8a8e", "7c7f80", "c2a166", 
    "b4865a", "b5603e", "4a3a24", "dc989e", "44a19f", "533e24", "a3913e", "e38a1d", 
    "8cb3fe", "6b9dfb", "927965", "495e27", "b9855c", "5a482c", "6a6e6f", "545454", 
    "100c1c", "49372c", "3d2e25", "bb6622", "4a2c23", "5c5c5c", "636363", "fbdc75", 
    "312c36", "4f4f4f", "cecaad", "9c7c4f", "717171", "fccbe7", "e6b3ad", "feac6d", 
    "af8f55", "3c3947", "151515", "7f7f7f", "888788", "738552", "c26b4c", "23161f", 
    "ae693c", "941818", "2b0178", "b26247", "17dd62", "e8f4b2", "d5da94", "d7c185", 
    "855029", "907540", "965d43", "251610", "4c3223", "3a2b24", "4c532a", "555a5a", 
    "677533", "95576c", "a25326", "734454", "8d3b2e", "b98323", "fec234", "d87803", 
    "92b9fe", "e6e6e6", "8f8f8f", "7f4234", "6f9323", "46403e", "8c674f", "fcfacd", 
    "4fab90", "51a48b", "89654d", "fffefd", "84c774", "ba6337", "492f17", "aa7954", 
    "c29d62", "7a5a34", "ecfbfb", "eeeae6", "9d573f", "f7c431", "af8e77", "111b21", 
    "e0eadd", "73c262", "36373f", "e9e9e9", "c8c9c8", "7f7f7f", "ea4318", "f8fdf8", 
    "456b52", "1c1c20", "3a40a6", "764a2b", "159295", "42494c", "597417", "43bde1", 
    "77bf19", "77bf19", "f87d1a", "822db1", "a82a23", "95958f", "f5f6f6", "fccf2f", 
    "646464", "585858", "414141", "6a344b", "287067", "64479e", "90552d", "30181c"
]

def get_closest_pure_color(color):
    color = color.lower()
    min_distance_pure = float('inf')
    min_distance_white = float('inf')
    closest_pure_color = None
    closest_white_color = None
    r, g, b = int(color[:2], 16), int(color[2:4], 16), int(color[4:], 16)
    for pure_color in pure_colors:
        pr, pg, pb = int(pure_color[:2], 16), int(pure_color[2:4], 16), int(pure_color[4:], 16)
        distance_pure = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
        distance_white = (r - 255) ** 2 + (g - 255) ** 2 + (b - 255) ** 2
        if distance_pure < min_distance_pure:
            min_distance_pure = distance_pure
            closest_pure_color = pure_color
        if distance_white < min_distance_white:
            min_distance_white = distance_white
            closest_white_color = "ffffff"
    if min_distance_pure < min_distance_white:
        return closest_pure_color
    else:
        return closest_white_color

def get_rgb_values(image):
    width, height = image.size
    rgb_values = {}

    for y in range(height):
        for x in range(width):
            pixel = image.getpixel((x, y))

            if len(pixel) == 4 and pixel[3] == 0:
                hex_color = "transparent"
            else:
                r, g, b = pixel[:3]
                hex_color = '{:02x}{:02x}{:02x}'.format(r, g, b)
                if hex_color not in pure_colors:
                    hex_color = get_closest_pure_color(hex_color)
            
            pixel_index = x + y * width
            
            rgb_values[pixel_index] = [str(x), str(y), hex_color]

    rgb_values = dict(sorted(rgb_values.items()))

    return rgb_values

@app.route('/url', methods=['POST'])
def process_image_from_url():
    image_url = request.data
    width = int(request.headers.get('width'))
    height = int(request.headers.get('height'))
    if image_url:
        response = requests.get(image_url)

        if response.status_code == 200:
            image = Image.open(BytesIO(response.content))

            if image.width > width or image.height > height:
                image.thumbnail((width, height))           
            elif image.width > width:                      
                w_percent = width / float(image.width)     
                h_size = int(float(image.height) * float(w_percent)) 
                image = image.resize((width, h_size))    
            elif image.height > height:                    
                h_percent = height / float(image.height)    
                w_size = int(float(image.width) * float(h_percent))   
                image = image.resize((w_size, height)) 

            rgb_values = get_rgb_values(image)

            return jsonify({
                "values": rgb_values,
                "width": image.width,
                "height": image.height
            })
        else:
            return "Failed to download the image", 409
    else:
        return "No image URL provided in the request", 400

@app.route('/base64', methods=['POST'])
def process_image_from_base64():
    image_base64 = request.data
    width = int(request.headers.get('width'))
    height = int(request.headers.get('height'))

    if image_base64:
        image_data = base64.b64decode(image_base64)
        image = Image.open(BytesIO(image_data))

        if image.width > width or image.height > height:
            image.thumbnail((width, height))           
        elif image.width > width:                      
            w_percent = width / float(image.width)     
            h_size = int(float(image.height) * float(w_percent)) 
            image = image.resize((width, h_size))    
        elif image.height > height:                    
            h_percent = height / float(image.height)    
            w_size = int(float(image.width) * float(h_percent))   
            image = image.resize((w_size, height)) 

        rgb_values = get_rgb_values(image)

        return jsonify({
            "values": rgb_values,
            "width": image.width,
            "height": image.height
        })
    else:
        return "No image provided in the request", 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
