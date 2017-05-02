# Webportal for the collection of disordered speech from people with severe physical impairments

## Prerequisite
* NodeJS (version >= 6.10.1)
* AWS Access Key and AWS Secret Access Key
* MongoDB URI (i.e mLab)
* Invisible reCAPTCHA Public Key and Secret Key
* Gmail account (with **"Allow Less Secure apps"** and **"Captcha
Enable"** enabled).

## Installation
1. Create **.env** file with the following lines and your own info:

    ```
    DATABASE_URI= Production database URI

    GMAIL_USERNAME= Gmail Username

    GMAIL_PASSWORD= Gmail Password

    AWS_ACCESS_KEY_ID= AWS Access Key

    AWS_SECRET_ACCESS_KEY= AWS Secret Acess Key

    RECAPTCHA_SECRET_KEY= reCAPTCHA Secret Key
    ```

2. Repalce the value of **"data-sitekey"** in **/views/user/signup.pug**, line 54 with your own reCAPTCHA Public Key.
3. `npm install -g babel-cli mocha nodemon`
4. `npm install`
5. Start server: `npm start`
6. Go to `localhost:3000`

## Author
Nguyen Thanh Trung

## License
WTFPL - Do What the Fuck You Want To Public License
