<p>Must have MySQL server setup already</p>

```
CREATE TABLE users (
    ip varchar(255),
    email varchar(255),
    password varchar(255),
    firstName varchar(255),
    lastName varchar(255),
    tier varchar(255),
    balance int,
    UID varchar(255),
    warnings LONGTEXT,
    completionsCount int,
    usedTokens int,
    Orders LONGTEXT,
    accountCreatedAt DATETIME,
    adsWatched int,
    adsClicked int,
    banned LONGTEXT,
    token varchar(255),
    refreshToken varchar(255)
);
```
remember sudo mysql -u root -p