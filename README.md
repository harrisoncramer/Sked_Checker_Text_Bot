# Congress Scrapers

These bots download data from every committee in the House and Senate, and upload the data to a MongoDB database.

## Getting Started

`git clone git@github.com:KingOfCramers/Sked_Checker_Text_Bot.git`
`yarn install`
`node app.js`

### Prerequisites

1) These bots require a running instance of MongoDB in order to work, with an admin user setup. While you can reconfigure the DB connection (in the `mongodb/connect/index.js` file) it is not recommended.
2) The bots also require a working installation of Chromium running on your local machine.
3) The app also requires an `.env` file stored in the working directory. The file must include the following information
`MONGO_PASS=**MongoDB Password For admin**`
`NODE_ENV=**production OR development**`
`TOR_PORTS=**the ports in torrc, as a string separated by spaces (see ./setup/index.js)**`

4) When running through the Tor network, you must have Tor installed on the local machine. My version of this app runs through Ubuntu 18.04, and an installation guide for Tor is online [here](https://linuxize.com/post/how-to-install-tor-browser-on-ubuntu-18-04/)

## Author

* **Harrison Cramer** - [@harrisoncramer](https://twitter.com/harrisoncramer)

This work was built for journalists at [National Journal](https://nationaljournal.com).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details