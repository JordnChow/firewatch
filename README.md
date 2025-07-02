# FIRE WATCH
Bushfire prediction and detection software.

## To run front-end:
Enter the folder firewatch-client in the terminal then:
1. Initialise npm
2. Install vite, papaparse and leaflet(gh-pages if you want to publish)
3. Now run npm run dev

## To run the prediction machine learning pipeline:
Enter the folder server in the terminal then:
1. Install requirements.txt ( pip install -r requirements.txt)
2. Set up an earth engine account
3. Run ee.initialise() in a python intepreter on your local machine
4. Then create a new project in earth engine
5. Remember the unique name for the project and replace "firewatch-464011" in get_results.py with your project name
6. Run prediction.py
7. You should find the results in the server folder

## To run the detection machine learning pipeline
Enter the folder server in the terminal then:
1. Install requirements.txt ( pip install -r requirements.txt) if you haven't already
2. Run detection.py

Warning! Running the prediction can overflow your RAM! Be wary!
If something does go wrong or your RAM is suffering press ctrl c in the terminal and
it may stop the program.

Note: I have included a sample video for the detection model


By Jordan Chow