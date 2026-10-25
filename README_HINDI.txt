CASAVELLE WEBSITE — WINDOWS SETUP GUIDE (HINDI/HINGLISH)
========================================================

SABSE ZAROORI:
Aapke computer par jo error aaya tha — "npm is not recognized" — iska matlab
ZIP file zaroori nahi kharab ho. Aam taur par Node.js install nahi hai, ya
install hone ke baad VS Code/Terminal restart nahi hua.

SABSE AASAN TAREEQA (COMMANDS TYPE KARNE KI ZAROORAT NAHI):
----------------------------------------------------------
1. Is ZIP ko Windows mein Extract All karein.
2. Extracted CASAVELLE_Website folder kholein.
3. 01_FIRST_TIME_SETUP.bat par double-click karein.
4. Agar Node.js missing hai, official Node.js page khulega.
5. Node.js ka LTS version download karke install karein (default options rakhein).
6. VS Code aur terminal band karke dobara kholein. Zaroorat pade to computer restart karein.
7. 01_FIRST_TIME_SETUP.bat par dobara double-click karein.
8. Pehli baar dependencies install hongi. Ismein internet aur kuch waqt lagega.
9. .env Notepad mein khule to ADMIN_EMAIL, ADMIN_PASSWORD aur JWT_SECRET set karein.
   Password aur secret ko private rakhein; kisi ko share na karein.
10. Setup complete hone par browser khulega. Terminal window ko band na karein.

AGLI BAAR WEBSITE CHALANE KE LIYE:
---------------------------------
CASAVELLE_Website folder mein 02_START_WEBSITE.bat par double-click karein.
Website use karte waqt khuli hui terminal window band na karein.

WEBSITE LINKS (sirf jab server chal raha ho):
Main website:       http://localhost:3000
Admin dashboard:    http://localhost:3000/admin.html

BRAND DETAILS:
Brand: CASAVELLE — Elevate Your Living.
Products: Round, Square, Rectangle, Wash Basin and Decorative Wall Mirrors.
Initial market: Amroha and Moradabad, Uttar Pradesh.
WhatsApp: +91 93898 67765 / +91 96901 90316

IMPORTANT BEFORE SELLING:
- Abhi product prices aur visuals sample/illustrative hain. Apni asli photos,
  exact dimensions, prices, stock, delivery fees aur policies update karein.
- Yeh local development setup hai; localhost website sirf aapke computer par khulti hai.
- Public internet par launch karne se pehle secure hosting, HTTPS, database,
  backups, validation, rate limiting aur security review zaroori hain.
- Online payment gateway, courier integration aur automated messages included nahin hain.
- Privacy, terms aur returns pages ko actual business policy ke mutabiq finalise karein.
- .env file private rakhein; ise public repository mein upload na karein.

FEATURES IN THIS STARTER:
- Responsive luxury storefront
- Product categories, search and price filtering
- Product enquiry through WhatsApp
- Customer signup/login
- Backend API and basic JSON file storage
- Admin dashboard for products and orders
- About, Privacy, Terms and Returns pages

TROUBLESHOOTING:
- 'npm is not recognized': Node.js LTS install karein, phir VS Code/Windows restart karein.
- Browser mein site nahi khulti: terminal mein npm start chal raha hona chahiye.
- 'Port already in use': purana website terminal band karein ya computer restart karein.
- Setup ke dauran internet connection active rakhein.

ONLINE SERVER PAR LIVE KARNE KE LIYE:
DEPLOY_ONLINE_HINDI.txt file padhein. Yeh Node.js backend website hai; ise static HTML hosting par upload karke login/admin backend nahi chalega. Node.js-supported hosting chahiye.
