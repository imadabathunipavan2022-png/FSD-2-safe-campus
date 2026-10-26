============================================================
                 SAFECAMPUSSOS
        Smart Campus Emergency Assistance System
============================================================

PROJECT DESCRIPTION
-------------------

SafeCampusSOS is a smart campus emergency assistance web
application designed to help students quickly access
different campus safety and emergency services from a
single platform.

The application provides an easy-to-use emergency interface
with different categories such as medical emergencies,
security and safety, ragging/harassment, fire emergencies,
campus map, and lost & found.


MAIN FEATURES
-------------

1. Medical Emergency
   Provides access to the medical emergency section.

2. Security & Safety
   Provides access to campus security and safety assistance.

3. Ragging / Harassment
   Provides a section for reporting or getting support for
   ragging and harassment-related situations.

4. Fire Emergency
   Provides access to the fire emergency section.

5. Virtual Campus Map
   Helps users find important locations on campus.

6. Lost & Found
   Provides access to lost and found services.

7. Emergency Reporting
   Emergency selections can be sent to the backend server
   and stored as reports.

8. Backend API
   A Node.js and Express.js backend handles emergency
   reports and provides API endpoints.

9. Responsive Interface
   The application is designed to work on computers,
   tablets, and mobile devices.


TECHNOLOGIES USED
-----------------

Frontend:
- HTML5
- CSS3
- JavaScript

Backend:
- Node.js
- Express.js
- CORS

Data Storage:
- JSON file (reports.json)

Deployment:
- Netlify can be used for hosting the frontend.


PROJECT STRUCTURE
-----------------

index.html
    Main SafeCampusSOS homepage.

selection.html
    Emergency category selection page.

medicalEmergency.html
    Medical emergency page.

fireemergency.html
    Fire emergency page.

raggingorharrasment.html
    Ragging and harassment page.

secuirity&safety.html
    Security and safety page.

cardlost.html
    Lost and found page.

virtualmap.html
    Virtual campus map page.

cursor.html
    Cursor-related interface page.

style.css
    Common styling and visual design.

api.js
    Frontend API service used to communicate with the
    backend.

server.js
    Node.js + Express backend server.

reports.json
    Local storage file containing emergency reports.


BACKEND API
-----------

The backend provides the following REST API endpoints:

GET /api/status
    Checks whether the backend is running.

POST /api/report
    Sends and stores an emergency report.

GET /api/reports
    Retrieves stored emergency reports.


LOCAL DEVELOPMENT
-----------------

1. Open the project folder in a terminal.

2. Install the required Node.js packages:

   npm install express cors

3. Start the backend:

   node server.js

4. Open the application:

   http://localhost:5000


IMPORTANT
---------

The backend must be running for emergency reports to be
sent and stored during local development.

The frontend API configuration currently uses:

http://localhost:5000/api

For public deployment, the backend must be hosted online
and the API URL in api.js must be changed to the deployed
backend URL.


DEPLOYMENT
----------

The frontend can be deployed using Netlify.

Users can access the deployed website through a public
Netlify URL without needing a Netlify account.

Only the project owner/developer manages the deployed
website and its source files.


PROJECT PURPOSE
---------------

The purpose of SafeCampusSOS is to provide students with
a centralized and simple digital platform for accessing
campus emergency and safety-related services.

The system is intended as a project prototype and should
be integrated with authorized campus emergency services
before being used as a real emergency-response system.


============================================================
                 SafeCampusSOS
          Smart Campus Safety Solution
============================================================