> chch

5ch 用スクリプト集だよ

### hosyu

```
$ chch hosyu http://hebi.5ch.net/test/read.cgi/news4vip/1556625403
```

```
保守スタート
新・保守時間目安表 (休日用)
00:00-02:00 10分以内
02:00-04:00 20分以内
04:00-09:00 40分以内
09:00-16:00 15分以内
16:00-19:00 10分以内
19:00-00:00 5分以内

新・保守時間の目安 (平日用)
00:00-02:00 15分以内
02:00-04:00 25分以内
04:00-09:00 45分以内
09:00-16:00 25分以内
16:00-19:00 15分以内
19:00-00:00 5分以内

posted: Sat May 11 2019 15:21:55 GMT+0900 (GMT+09:00) next: 15min
posted: Sat May 11 2019 15:06:53 GMT+0900 (GMT+09:00) next: 15min
```

### dump

スレッド情報とレス一覧の取得

```
$ chch dump https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/
```

```
{
  "title": "プログラム「a=a+b」←こいつｗｗｗｗｗｗ",
  "url": "https://hebi.5ch.net/test/read.cgi/news4vip/1562479977/",
  "postCount": null,
  "posts": [
    {
      "number": "1",
      "name": "以下、5ちゃんねるからVIPがお送りします",
      "userId": "",
      "timestamp": 1562479977678,
      "comma": 678,
      "message": "算数もできないのかよ……"
    },
    {
      "number": "2",
...
```

```
$ chch dump https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/ |jq '.posts[].comma'
```

```
678
133
487
517
787
...
```

### dump-threads

スレッド一覧の dump

```
chch dump-threads
```

```
# スレタイ検索
chch dump-threads |jq -r '.threads[] | "\(.title)\t\(.url)"' |peco
```

### trip-dig

トリップの採掘

```
chch trip-dig [prefix] [regex] [start | "a"] [interval | 100]
```

- regex: ログする文字列。正規表現。
- start: suffix の初期値。途中で停止して再開するときなどに指定する。使える文字列は a-zA-Z。(default: "a")
- interval: sleep する間隔。大きいほど CPU 使う。(default: 100)

```
# 正規表現
chch trip-dig p____ "[0-9]+vip(vi)+$"

# ゆっくり
chch trip-dig p____ "^vip" aaaaaaa 10

# ガンガン採掘
chch trip-dig p____ "^vip" aaaaaaa 10000
```

### watch

スレの監視と新着ポストの標準出力

```
chch watch [url] [command]
```

```
# 受取時に音を出す
chch watch https://hebi.5ch.net/test/read.cgi/news4vip/1562153470/ "say got"
```
