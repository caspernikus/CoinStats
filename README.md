# CoinStats

![wallpaper.png](https://res.cloudinary.com/hpiynhbhq/image/upload/v1519826924/fhzkk48ggdqnsfzkuvts.png)

#### What is the project about?
CoinStats is a NodeJS Cryptocurrency Statistic Bot for Steemit or other Platforms. CoinStats retrieves the last 24 historical data for specified coins and generates line chart images from it. These images are uploaded directly to the LBRY Blockchain and a Markdown File is generated.

#### Technology Stack
CoinStats is written in JavaScript and uses NodeJS for running. Also does CoinStats use Spee.ch to upload images directly to the LBRY Blockchain and [Cryptocompare](https://www.cryptocompare.com/) is used for historical coin data. Charts are generated with the [ChartJS](http://www.chartjs.org/) Open Source Project. 

##### Current Version: V.0.3

##### Roadmap
- V.0.1:
  - Markdown File generation
  - Chart generation
  - Upload to LBRY Blockchain
- V.0.2:
  - Create directly Steemit Post
  - Better Charts
- V.0.3:
  - Bar Charts shows only percentage change over last week
  - Toggle Steemit auto posting via config
  - Clearing img/ folder after upload
- V.1.0:
  - More information (e.g different Charts for each Coin)
  - Running on a Server and automatically post every day
  - Custom messages for the coins
  - Better overall layout

#### How to use ?
- Create a img/ folder
- Run `node index.js`

#### How to contribute?
- Go to the repository
- Fork it
- Make changes
- Create PR (Pull Request)
