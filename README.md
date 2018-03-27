# nodejs-twitter-example
**the example for receiving twitter stream api via nodejs**

這是用來練習如何使用 stream 接收 twitter 的 user stream，再發送 tweet 的程式。在這之前，你必須要安裝：

* nodejs, version 6.0 up
* mongodb, version 3.2 up

## 如何使用？
1. 先去 twitter 申請帳號

    這會取得 consumer_key, consumer_secret, access_token_key, access_token_secret 取得完後，再把值填入 config/twitter.js

2. 切換目錄到 /nodejs-twitter-example 並執行 :

        node install

    這會安裝寫在 package.js 內所需要的套件

3. 主要程序有三個
   * init_collection.js

       這會初始化在這個 example 內所需要的 mongodb collection，需要的 collections 都寫在 config/mongodb.js 裡

   * recieve_stream.js

        這是用 stream 的方式來接收 twitter 帳號所收到的 direction message，再把所收到的 direction message 寫入到 mongodb 內

   * tweet.js

       這也是用 stream 的方式接收 mongodb 的 capped collection，接收到後，再送 tweet 到 twitter

4. 執行

        $ node init_collection.js
        $ node recieve_stream.js
        $ node tweet.js