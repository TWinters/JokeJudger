# JokeJudger
Platform for collecting data about "I like my X like I like my Y, Z" jokes.

A running instance of this platform can be visited on [JokeJudger.com](http://jokejudger.com/) ([mirror](https://jokejudger.herokuapp.com)).
The platform is build using MySQL and NodeJS with ExpressJS in the backend, and Bootstrap and AngularJS for the front-end.


## Deploying JokeJudger

1. **Set up a MySQL server:**
This can be done in several ways, depending on the platform.
For Windows, [WampServer](http://www.wampserver.com/en/) can be used.

2. **Load MySQL database schema:**
The JokeJudger schema can be found in `design > database_diagram.mwb`.
This schema needs to be imported into the MySQL database.

3. **Install NodeJS:**
In order to run the JokeJudger server, [NodeJS](https://nodejs.org/en/) has to be installed.

4. **Set up the environment and run NodeJS:**
In order for JokeJudger to run, it has to know where the database is.
The environment has to contain the following variables with the correct values for the created database:
\texttt{MYSQL\_HOST}, \texttt{MYSQL\_USERNAME}, \texttt{MYSQL\_PASSWORD} and \texttt{MYSQL\_DATABASE}.
Optionally, to allow JokeJudger to send mails when creating an account and allowing users to reset their password, an SMTP server can be linked. linked with the variable \texttt{SMTP\_HOST}, \texttt{SMTP\_USER} and \texttt{SMTP\_PASSWORD}.

| Environment variable | Description |
| ---------------- |---------------------------|
| MYSQL_DATABASE   | The name of the database schema. |
| MYSQL_HOST       | The host of the MySQL database server. |
| MYSQL_PASSWORD   | The password to log into the MySQL database. |
| MYSQL_USERNAME   | The username to log into the MySQL database. |
| SMTP_HOST        | The host of the SMTP server to send mails to users with. |
| SMTP_PASSWORD    | The password of the user of the SMTP server. |
| SMTP_SENDER_MAIL | The mail that is used in the 'From' headers of mails send with the platform. |
| SMTP_USER        | The username of the user of the SMTP server. |
| WEBSITE_URL      | The URL of the website, to be included in the mails send with the platform. |


After the environment is set up, the server can be started using the command `node server`.

## JokeJudger Data

We made the data collected by JokeJudger during our research available in a (seperate, public repository)[https://github.com/TWinters/JokeJudger-Data].

## Extending JokeJudger to Other Types of Jokes

The JokeJudger is made for collecting jokes using the "I like my X like I like my Y, Z"-template.
As such, jokes are saved as `X`, `Y`, `Z`.
In order to collect jokes using any template, several small steps have to be undertaken in order to make the platform look right.

1. **Removing the template application**:
The jokes service component, which can be found under `public > js > services > jokes.js`, has to be changed to just return `joke.x`, as this is where we will save the full joke.

2. **Updating the create page:**
The create page, found in `public > views > create.html` should be modified such that the input fields for `Y` and `Z`, the generator and the suggestion elements are removed, as they would not make sense any more.
The input field of `X` should also be changed to a text field to a text area, as to allow long jokes.

3. **Updating the database:**
In the MySQL database header of the `jokes` table, the type of `x` needs to be changed to `TEXT` in order to allow for more jokes longer than 255 characters.
