Students:
Lior Halfon
Hen Marom

In order to see textures you'll need to run a local http server (so the browser can have access to the texture files).
To run a simple Python http server:
1. Download and install Python from www.python.org if not already installed (make sure to add environment variables when installing)
2. Run this from the windows command line:

# in Python ver 2.x
python -m SimpleHTTPServer


# in Python ver Python 3.x
python -m http.server

3. Enter to http://localhost:8000/ in the browser (Chrome).
4. Copy the project folder to the current directory that is shown in http://localhost:8000/
5. Enter to the project folder and run 'index.html'.

Assumption:
1. The html file is running on the local http server.
2. The project is tested with chrome browser
