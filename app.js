const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const fs = require('fs');
const bodyParser = require('body-parser');
const tools = require('./module/tools.js');
const msg = require('./module/message.js');
const db = require('./module/db.js');
const tc = require('./module/tablecolumn.js');
const app = express();
const os = require('os');
const helmet = require("helmet");
const tokensCsrf = require("csrf");
const tokens = new tokensCsrf();
const pageSize = 30; // download画面の1ページの表示データ行数
const commaMark = ","; // ファイル分割符号：カンマ
const tabMark = "\t"; // ファイル分割符号：タブ
const quotMark = "\""; // ファイル分割符号：クォーテーション
const splitSizeMark = "-"; // 桁数チェック分割符号
const underscoreMark = "_"; // アンダーバー符号
const uploadFileSize = "104857600"; // アップロードファイル最大サイズ 単位：バイト
const kengen_view = "01"; // 参照権限
const kengen_update = "02"; // 更新権限
const pool = db.pool;
const cryptoJS = require("crypto-js");

//session情報を設定
app.use(session({
    secret: 'secret',
    name: "fashion",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 5, // セッションの時間
        httpOnly: true,
        secure: false,
    },
    rolling: true,
}));

app.use(helmet({ contentSecurityPolicy: false })); // helmetの導入
app.use(express.static("static")); // 配置ファイルのインポート
app.engine('html', ejs.__express); // ejs→htmlファイルに変更
app.set('view engine', 'html'); // htmlファイルのインポート
app.use(bodyParser.urlencoded({ extended: false })); // formデータ
app.use(bodyParser.json()); // JSONデータ

// 初期画面
app.get("/", (req, res) => {
    // 以下のHTTPレスポンスヘッダーを付与
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // 秘密文字 と トークン を取得
    var secret = req.session._csrf;
    const token = getToken(req);
    // ログインセッションの有無を確認する
    if (req.session.sessLoginId && tokens.verify(secret, token)) {
        // セッションがある場合、メニュー画面へ遷移
        res.render("menu", {
            loginid: req.session.sessLoginId,
            username: req.session.sessUsername,
            kigyoname: req.session.sessKigyoname,
        });
    } else {
        // セッションがない場合、login画面へ遷移する
        res.render("login", {
            msg: "",
            loginId: ""
        })
    }
});

// ログイン画面の「ログイン」ボタン
app.post("/doLogin", (req, res) => {
    // 以下のHTTPレスポンスヘッダーを付与
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // 新規に 秘密文字 と トークン を生成
    var secret = tokens.secretSync();
    var token = tokens.create(secret);
    // 秘密文字はセッションに保存
    req.session._csrf = secret;
    // トークンはクッキーに保存
    res.setHeader('Set-Cookie', [`token=${token}`]);

    // 秘密文字 と トークン の組み合わせが正しいか検証
    if (tokens.verify(secret, token) === false) {
        writelog("ERROR", "ログイン画面", req.session.sessLoginId, "Invalid Token");
        // ログイン状態を削除
        deleteLoginStatus(req);
        res.render("login", {
            msg: msg.M0009,
            loginId: ""
        });
        return;
    }

    // ユーザとパスワードを取得
    var postData = req.body;
    var loginId = postData.loginId;
    var loginPw = postData.loginPw;
    writelog("INFO", "ログイン画面", loginId, "ログイン画面へアクセスしました");

    //暗号化キー:"testkey"を用いて復号化
    var des = loginPw;
    var decrypted = cryptoJS.AES.decrypt(des, "hashkey");
    var decrypt = decrypted.toString(cryptoJS.enc.Utf8);
    loginPw = decrypt;

    // 必須チェック
    if (loginId.length == 0 || loginPw.length == 0) {
        writelog("ERROR", "ログイン画面", loginId, "必須入力です。");
        res.render("login", {
            msg: msg.M0011,
            loginId: loginId
        });
        return;
    }

    // 禁則文字チェック
    if (!tools.checkInputChar(loginId) || !tools.checkInputChar(loginPw)) {
        writelog("ERROR", "ログイン画面", loginId, "入力項目にエラーがあります。（禁則文字）");
        res.render("login", {
            msg: msg.M0005,
            loginId: loginId
        });
        return;
    }

    // 英数字チェック
    if (!tools.checkApNo(loginId) || !tools.checkApNo(loginPw)) {
        writelog("ERROR", "ログイン画面", loginId, "入力項目にエラーがあります。");
        res.render("login", {
            msg: msg.M0012,
            loginId: loginId
        });
        return;
    }

    // sql作成
    var client;
    var checkLoginSql = `select a.userid, a.username, a.shozokukigyocode from m001 as a where a.userid = '${loginId}' and a.loginpw = '${loginPw}'`;
    (async () => {
        try {
            // DBコネクションとSQL実行
            client = await pool.connect();
            const result = await client.query(checkLoginSql);

            // データ取得できない場合
            if (result.rowCount == 0) {
                writelog("ERROR", "ログイン画面", loginId, "ログインIDまたはPWが間違っています。");
                res.render("login", {
                    msg: msg.M0001,
                    loginId: loginId
                });
                return;
            }

            // ログイン状態の確認
            var loginStatusSql = `select a.loginstatus from m001 as a where a.userid = '${loginId}' and (a.koshinbi + interval '00:05') > now()`;
            const loginStatusResult = await client.query(loginStatusSql);
            if (loginStatusResult.rowCount > 0 && loginStatusResult.rows[0].loginstatus == "01") {
                writelog("ERROR", "ログイン画面", loginId, "そのユーザＩＤで作業中のユーザが居ます。ログアウトされるまで二重ログインできません。");
                res.render("login", {
                    msg: msg.M0002,
                    loginId: loginId
                });
                return;
            }
            // ログイン中に更新
            updateLoginStatus(res, loginId);

            // 企業名を取得
            var shozokukigyocode = result.rows[0].shozokukigyocode;
            var getKigyonameSql = `select a.kigyoname from m002 as a where a.kigyocode = '${shozokukigyocode}'`;
            const kigyonameResult = await client.query(getKigyonameSql);
            if (kigyonameResult.rowCount > 0) {
                req.session.sessKigyoname = kigyonameResult.rows[0].kigyoname;
            }

            // 参照権限　権限保持企業コードを取得
            var kengenkigyocodeArray = [];
            var kengenkigyocodeView = "";
            getKengenKigyocodeSql = `select a.kengenkigyocode, a.shorikengen from m005 as a where a.kigyocode = '${shozokukigyocode}' and (a.shorikengen = '${kengen_view}' or a.shorikengen = '${kengen_update}')`;
            const kengenkigyocodeResult = await client.query(getKengenKigyocodeSql);
            for (var i = 0; i < kengenkigyocodeResult.rows.length; i++) {
                var kengenkigyocode = kengenkigyocodeResult.rows[i].kengenkigyocode.trim();
                var shorikengen = kengenkigyocodeResult.rows[i].shorikengen.trim();
                // 更新権限の場合
                if (kengen_update === shorikengen) {
                    // 更新権限
                    kengenkigyocodeArray.push(kengenkigyocode);

                    // 更新・参照権限
                    kengenkigyocodeView += `'${kengenkigyocode}'`;
                    if (i < kengenkigyocodeResult.rows.length - 1) {
                        kengenkigyocodeView += ", ";
                    }
                }

                // 参照権限の場合
                if (kengen_view === shorikengen) {
                    // 更新・参照権限
                    kengenkigyocodeView += `'${kengenkigyocode}'`;
                    if (i < kengenkigyocodeResult.rows.length - 1) {
                        kengenkigyocodeView += ", ";
                    }
                }
            }

            // セッションの設定
            req.session.sessLoginId = loginId;
            req.session.sessUsername = result.rows[0].username;
            req.session.sessShozokukigyocode = shozokukigyocode;
            req.session.sessKengenkigyocodeArray = kengenkigyocodeArray;
            req.session.sessKengenkigyocodeView = kengenkigyocodeView;

            // メニュー画面へ遷移
            res.render("menu", {
                loginid: req.session.sessLoginId,
                username: req.session.sessUsername,
                kigyoname: req.session.sessKigyoname,
            });

        } catch (error) {
            writelog("ERROR", "ログイン画面", loginId, "ログインが失敗しました");
            console.log(error);
            // ログイン状態を削除
            deleteLoginStatus(req);
            res.render("login", {
                msg: msg.M0017,
                loginId: ""
            });
        } finally {
            await client.release(true);
        }
    })();
});

// 「戻る」ボタン
app.get("/menu", check, (req, res) => {
    writelog("INFO", "メニュー画面", req.session.sessLoginId, "メニュー画面へアクセスしました");
    // 以下のHTTPレスポンスヘッダーを付与
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // メニュー画面へ遷移
    res.render("menu", {
        loginid: req.session.sessLoginId,
        username: req.session.sessUsername,
        kigyoname: req.session.sessKigyoname,
    });
});

// メインエリアの「アップロード画面遷移」ボタン
app.get("/moveUploadPage", check, (req, res) => {
    writelog("INFO", "アップロード画面", req.session.sessLoginId, "アップロード画面へアクセスしました");
    // 以下のHTTPレスポンスヘッダーを付与
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // プルダウンの表示項目取得
    var client;
    var pulldownSql = "select tableid, filename from m006 where screenid = '1' order by hyouzizyun";
    (async () => {
        try {
            // DBコネクションとSQL実行
            client = await pool.connect();
            const result = await client.query(pulldownSql);

            var displayPulldown = [];
            for (var i = 0; i < result.rows.length; i++) {
                var displayRowData = [];
                displayRowData.push(result.rows[i].tableid.trim());
                displayRowData.push(result.rows[i].filename.trim());
                displayRowData.push("");
                displayPulldown.push(displayRowData);
            }

            // upload画面へ遷移する
            res.render("upload", {
                msg: "",
                filesizeOverMsg: msg.M0014,
                noselectfileMsg: msg.M0013,
                nofiletypeMsg: msg.M0016,
                loginid: req.session.sessLoginId,
                username: req.session.sessUsername,
                kigyoname: req.session.sessKigyoname,
                uploadFileSize: uploadFileSize,
                displayPulldown: displayPulldown,
            })
        } catch (error) {
            writelog("ERROR", "アップロード画面", req.session.sessLoginId, "プルダウンデータ取得が失敗しました");
            console.log(error);
            // ログイン状態を削除
            deleteLoginStatus(req);
            res.render("login", {
                msg: msg.M0017,
                loginId: ""
            });
        } finally {
            await client.release(true);
        }
    })();
});

// メインエリアの「ダウンロード画面へ遷移」ボタン
app.get('/moveDownloadPage', check, function (req, res) {
    writelog("INFO", "ダウンロード画面", req.session.sessLoginId, "ダウンロード画面へアクセスしました");
    // 以下のHTTPレスポンスヘッダーを付与
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // プルダウンの表示項目取得
    var client;
    var pulldownSql = "select tableid, filename from m006 where screenid = '2' order by hyouzizyun";
    (async () => {
        try {
            // DBコネクションとSQL実行
            client = await pool.connect();
            const result = await client.query(pulldownSql);

            var displayPulldown = [];
            for (var i = 0; i < result.rows.length; i++) {
                var displayRowData = [];
                displayRowData.push(result.rows[i].tableid.trim());
                displayRowData.push(result.rows[i].filename.trim());
                displayRowData.push("");
                displayPulldown.push(displayRowData);
            }

            // download画面へ遷移する
            res.render("download", {
                hattyuubangoColumn: "",                     // 画面検索項目の発注番号
                hinbanColumn: "",                           // 画面検索項目の品番
                shohincodeColumn: "",                       // 画面検索項目の商品コード
                tyakuyoteibiColumn: "",                     // 画面検索項目の当初着予定日
                tenpotyakukiboubiColumn: "",                // 画面検索項目の店舗着希望日
                toutyakuyoteibiColumn: "",                  // 画面検索項目の分納着予定日
                nyukayoteibiColumn: "",                     // 画面検索項目の入荷予定日
                displayPulldown: displayPulldown,           // 画面プルダウンのダウンロードファイル種選択
                exttypecsv: "",                             // 画面プルダウンのダウンロードファイル拡張子選択
                exttypetsv: "",                             // 画面プルダウンのダウンロードファイル拡張子選択
                nofiletypeMsg: msg.M0016,                   // メッセージ：ファイル種類を選択していません。
                noexttypeMsg: msg.M0010,                    // メッセージ：ファイル拡張子を選択していません。
                displaycolumnInfo: "",                      // データ部のタイトル
                datalist: [],                               // 画面データ
                currentPage: 1,                             // 現在ページ
                page: 0,                                    // 総ページ数
                downloadMsg: "",                            // ダウンロード正常メッセージ
                loginid: req.session.sessLoginId,           // ログインID
                username: req.session.sessUsername,         // タイトル部のユーザ名
                kigyoname: req.session.sessKigyoname,       // タイトル部の企業名
                msg: ""
            })
        } catch (error) {
            writelog("ERROR", "アップロード画面", req.session.sessLoginId, "プルダウンデータ取得が失敗しました");
            console.log(error);
            // ログイン状態を削除
            deleteLoginStatus(req);
            res.render("login", {
                msg: msg.M0017,
                loginId: ""
            });
        } finally {
            await client.release(true);
        }
    })();
});

// アップロード画面の「アップロードファイルフォルダ指定」ボタン
var cpUpload = tools.multer().fields([{ name: 'uploadFile', maxCount: 1 }]);
app.post("/uploadFile", check, cpUpload, (req, res) => {
    writelog("INFO", "アップロード画面", req.session.sessLoginId, "参照が実行されました");
});

// アップロード画面の「実行」ボタン
app.post("/doUpload", check, (req, res) => {
    writelog("INFO", "アップロード画面", req.session.sessLoginId, "アップロードが実行されました");
    // 以下のHTTPレスポンスヘッダーを付与
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // メッセージの配列
    var message = [];
    // 画面入力データ取得
    var postData = req.body;
    var filetype = postData.filetype; // ダウンロード対象テーブル
    var fileName = postData.uploadFileName; // アップロードファイル名
    var filePath = "./static/upload/" + fileName;
    var client;
    var displayPulldown = [];
    (async () => {
        try {
            writelog("INFO", "アップロード画面", req.session.sessLoginId, "アップロードファイル名： " + fileName);

            // プルダウンを選択する場合
            var pullDownSelectedFlg = true;

            // プルダウンの表示項目取得
            var pulldownSql = "select tableid, filename from m006 where screenid = '1' order by hyouzizyun";
            // DBコネクションとSQL実行
            client = await pool.connect();
            const result = await client.query(pulldownSql);
            for (var i = 0; i < result.rows.length; i++) {
                var displayRowData = [];
                var tableid = result.rows[i].tableid.trim();
                displayRowData.push(tableid);
                displayRowData.push(result.rows[i].filename.trim());
                if (filetype == tableid) {
                    displayRowData.push("selected");
                    pullDownSelectedFlg = false;
                } else {
                    displayRowData.push("");
                }
                displayPulldown.push(displayRowData);
            }

            // プルダウンを選択しない場合
            if (pullDownSelectedFlg) {
                // エラー情報
                writelog("ERROR", "アップロード画面", req.session.sessLoginId, "ファイル種類を選択してください。");
                message.push(msg.M0016);
                res.render("upload", {
                    msg: message,
                    filesizeOverMsg: msg.M0014,
                    noselectfileMsg: msg.M0013,
                    nofiletypeMsg: msg.M0016,
                    loginid: req.session.sessLoginId,
                    username: req.session.sessUsername,
                    kigyoname: req.session.sessKigyoname,
                    uploadFileSize: uploadFileSize,
                    displayPulldown: displayPulldown,
                });
                return;
            }

            // ファイル選択チェック
            if (fileName == "" || !fs.existsSync(filePath)) {
                // エラー情報
                writelog("ERROR", "アップロード画面", req.session.sessLoginId, "アップロードするファイルを指定してください。");
                message.push(msg.M0013);
                res.render("upload", {
                    msg: message,
                    filesizeOverMsg: msg.M0014,
                    noselectfileMsg: msg.M0013,
                    nofiletypeMsg: msg.M0016,
                    loginid: req.session.sessLoginId,
                    username: req.session.sessUsername,
                    kigyoname: req.session.sessKigyoname,
                    uploadFileSize: uploadFileSize,
                    displayPulldown: displayPulldown,
                });
                return;
            }

            // ファイル名中のテーブル名と取得
            var tableName = filetype;

            // csvデータ取得
            var allFileData = fs.readFileSync(filePath).toString();

            var fileData = [];
            if (allFileData.match('\r\n')) {  // 改行の確認
                fileData = allFileData.split('\r\n');
            } else {
                fileData = allFileData.split('\n');
            }

            // 定義ファイルのカラム情報を取得
            var columnInfo = eval("tc." + tableName);
            var kengeninfo = eval("tc.kengeninfo_" + tableName);

            // 参照権限　権限保持企業コードを取得
            var genkigyocodeArray = req.session.sessKengenkigyocodeArray;

            //ファイル内容チェック
            for (var i = 1; i < fileData.length; i++) {
                var lineString = fileData[i].slice(0, - 1).slice(1);
                var lineArray = lineString.split(quotMark + commaMark + quotMark); //1行データの解析
                // 最終行が空行の場合
                if (i == fileData.length - 1 && lineString.length == 0) {
                    break;
                };

                // 行番号
                var lineNo = i + 1;

                // 権限チェック
                var checkKengen = false;
                var kenGencolumnNo;
                for (var j = 0; j < kengeninfo.length; j++) {
                    kenGencolumnNo = kengeninfo[j][1];
                    var genkigyocode = lineArray[kenGencolumnNo].trim();
                    if (genkigyocodeArray.indexOf(genkigyocode) >= 0) {
                        checkKengen = true;
                        break;
                    }
                }
                // 権限がない場合、飛ばす
                if (!checkKengen) {
                    var errormsg = msg.M0015.replace("lineNo", lineNo).replace("columnNo", kenGencolumnNo).replace("message", msg.M0015_0701).replace("detail", msg.M0015_0702);
                    writelog("ERROR", "アップロード画面", req.session.sessLoginId, errormsg);
                    message.push(errormsg);
                }

                // カラム情報の分析
                for (var j = 0; j < columnInfo.length; j++) {
                    // カラムはファイル中の位置
                    var index = columnInfo[j][1];
                    var columnNo = index + 1;
                    // nullチェック
                    var checkNull = columnInfo[j][2];
                    if (checkNull == "1") {
                        if (!tools.checkNull(lineArray[index])) {
                            var errormsg = msg.M0015.replace("lineNo", lineNo).replace("columnNo", columnNo).replace("message", msg.M0015_0101).replace("detail", msg.M0015_0102);
                            writelog("ERROR", "アップロード画面", req.session.sessLoginId, errormsg);
                            message.push(errormsg);
                        };
                    }

                    // 英数字チェック
                    var checkApNo = columnInfo[j][3];
                    if (checkApNo == "1") {
                        if (!tools.checkApNo(lineArray[index])) {
                            var errormsg = msg.M0015.replace("lineNo", lineNo).replace("columnNo", columnNo).replace("message", msg.M0015_0301).replace("detail", msg.M0015_0302);
                            writelog("ERROR", "アップロード画面", req.session.sessLoginId, errormsg);
                            message.push(errormsg);
                        };
                    }

                    // 数字チェック
                    var checkNo = columnInfo[j][4];
                    if (checkNo == "1") {
                        if (!tools.checkNo(lineArray[index])) {
                            var errormsg = msg.M0015.replace("lineNo", lineNo).replace("columnNo", columnNo).replace("message", msg.M0015_0401).replace("detail", msg.M0015_0402);
                            writelog("ERROR", "アップロード画面", req.session.sessLoginId, errormsg);
                            message.push(errormsg);
                        };
                    }

                    // 日付チェック
                    var checkDate = columnInfo[j][5];
                    if (checkDate == "1") {
                        if (!tools.checkDate(lineArray[index])) {
                            console.log("日付チェック22eeor2")
                            var errormsg = msg.M0015.replace("lineNo", lineNo).replace("columnNo", columnNo).replace("message", msg.M0015_0201).replace("detail", msg.M0015_0202);
                            writelog("ERROR", "アップロード画面", req.session.sessLoginId, errormsg);
                            message.push(errormsg);
                        };
                    }

                    // 桁数チェック
                    var checkSizeArray = columnInfo[j][6].split(splitSizeMark);
                    if (checkSizeArray[0] == "1") {
                        if (!tools.checkSize(lineArray[index], checkSizeArray[1])) {
                            var errormsg = msg.M0015.replace("lineNo", lineNo).replace("columnNo", columnNo).replace("message", msg.M0015_0501).replace("detail", msg.M0015_0502.replace("length", checkSizeArray[1]));
                            writelog("ERROR", "アップロード画面", req.session.sessLoginId, errormsg);
                            message.push(errormsg);
                        };
                    }

                    // 相関チェック
                    var checkCorrelationArray = columnInfo[j][8].split(splitSizeMark);
                    if (checkCorrelationArray[0] == "1" && lineArray[index] != null && lineArray[index] != "") {
                        var checkSql = "select count(1) count from ";
                        checkSql += checkCorrelationArray[1];
                        checkSql += " where " + checkCorrelationArray[2] + " = ";
                        checkSql += " '" + lineArray[index] + "'";

                        const checkSqlResult = await client.query(checkSql);

                        if (checkSqlResult.rows[0].count == 0) {
                            var errormsg = msg.M0015.replace("lineNo", lineNo).replace("columnNo", columnNo).replace("message", msg.M0015_0601).replace("detail", msg.M0015_0602.replace("columnName", checkCorrelationArray[2]));
                            writelog("ERROR", "アップロード画面", req.session.sessLoginId, errormsg);
                            message.push(errormsg);
                        }
                    }
                }
            }

            // エラーがある場合
            if (message.length > 0) {
                // エラーメッセージ5件設定
                var dispayMsg = [];
                for (var i = 0; i < message.length; i++) {
                    if (i === 5) {
                        break;
                    }
                    dispayMsg.push(message[i]);
                }
                res.render("upload", {
                    msg: dispayMsg,
                    filesizeOverMsg: msg.M0014,
                    noselectfileMsg: msg.M0013,
                    nofiletypeMsg: msg.M0016,
                    loginid: req.session.sessLoginId,
                    username: req.session.sessUsername,
                    kigyoname: req.session.sessKigyoname,
                    uploadFileSize: uploadFileSize,
                    displayPulldown: displayPulldown,
                });
                return;
            }

            // トランザクションの開始
            await client.query("BEGIN");

            // csvデータ更新処理
            for (var i = 1; i < fileData.length; i++) {
                var lineString = fileData[i].slice(0, - 1).slice(1);
                // 最終行が空行の場合
                if (i == fileData.length - 1 && lineString.length == 0) {
                    break;
                };

                var lineArray = lineString.split(quotMark + commaMark + quotMark); //1行データの解析

                // 既存データが存在するかチェック
                var searchCondition = getKeyCondition(tableName, lineArray);
                var checkkeySql = `select count(1) as count from ${tableName} ${searchCondition}`;
                var keyResult = await client.query(checkkeySql);

                if (keyResult.rows[0].count == 0) { //存在しない、データ挿入
                    var insertSql = getInsertSql(tableName, lineArray, req); // insert文の取得
                    await client.query(insertSql);
                } else {//存在する、データ更新
                    var updateSql = getUpdateSql(tableName, lineArray, searchCondition, req); // update文の取得
                    await client.query(updateSql);
                }
            }

            // コミット
            await client.query("COMMIT");

            message.push(msg.M0004);
            res.render("upload", {
                msg: message,
                filesizeOverMsg: msg.M0014,
                noselectfileMsg: msg.M0013,
                nofiletypeMsg: msg.M0016,
                loginid: req.session.sessLoginId,
                username: req.session.sessUsername,
                kigyoname: req.session.sessKigyoname,
                uploadFileSize: uploadFileSize,
                displayPulldown: displayPulldown,
            });
            return;
        } catch (error) {
            writelog("ERROR", "アップロード画面", req.session.sessLoginId, "アップロードに失敗しました。");
            console.log(error);
            message.push(msg.M0003);
            res.render("upload", {
                msg: message,
                filesizeOverMsg: msg.M0014,
                noselectfileMsg: msg.M0013,
                nofiletypeMsg: msg.M0016,
                loginid: req.session.sessLoginId,
                username: req.session.sessUsername,
                kigyoname: req.session.sessKigyoname,
                uploadFileSize: uploadFileSize,
                displayPulldown: displayPulldown,
            });
            return;
        } finally {
            await client.release(true);
            fs.unlink(filePath, (err) => { }); // ファイル削除
        }
    })();
});

// ダウンロード画面の「検索」ボタン
app.post('/doSearch', check, function (req, res) {
    writelog("INFO", "ダウンロード画面", req.session.sessLoginId, "検索が実行されました");
    // 以下のHTTPレスポンスヘッダーを付与
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // 画面入力データ取得
    var postData = req.body;
    var hattyuubangoColumn = postData.hattyuubangoColumn;                 // 画面検索項目の発注番号
    var hinbanColumn = postData.hinbanColumn;                             // 画面検索項目の品番
    var shohincodeColumn = postData.shohincodeColumn;                     // 画面検索項目の商品コード
    var tyakuyoteibiColumn = postData.tyakuyoteibiColumn;                 // 画面検索項目の当初着予定日
    var tenpotyakukiboubiColumn = postData.tenpotyakukiboubiColumn;       // 画面検索項目の店舗着希望日
    var toutyakuyoteibiColumn = postData.toutyakuyoteibiColumn;           // 画面検索項目の分納着予定日
    var nyukayoteibiColumn = postData.nyukayoteibiColumn;                 // 画面検索項目の入荷予定日
    var filetype = postData.filetype;                                     // 画面プルダウンのダウンロードファイル種選択
    var exttype = postData.exttype;                                       // 画面プルダウンのダウンロードファイル拡張子選択
    var exttypecsv = "";
    var exttypetsv = "";
    var displayPulldown = [];

    // csvを選択する場合
    if (exttype == "csv") {
        exttypecsv = "selected";
        // tsvを選択する場合
    } else if (exttype == "tsv") {
        exttypetsv = "selected";
        // 店別配分結果（SAN）を選択する場合
    }

    var currentPage = postData.index                                      // 現在ページ
    var index = (postData.index - 1) * pageSize;                          // SQLのOFFSET設定値
    var count = 0;                                                        // 画面表示データ件数
    var page = 0;                                                         // 総ページ数

    var client;
    (async function () {
        try {
            // プルダウンの表示項目取得
            client = await pool.connect();
            var pulldownSql = "select tableid, filename from m006 where screenid = '2' order by hyouzizyun";
            const result = await client.query(pulldownSql);
            for (var i = 0; i < result.rows.length; i++) {
                var displayRowData = [];
                var tableid = result.rows[i].tableid.trim();
                displayRowData.push(tableid);
                displayRowData.push(result.rows[i].filename.trim());
                if (filetype == tableid) {
                    displayRowData.push("selected");
                } else {
                    displayRowData.push("");
                }
                displayPulldown.push(displayRowData);
            }

            // 入力文字
            var ipnutData = hattyuubangoColumn + hinbanColumn + shohincodeColumn + tyakuyoteibiColumn.replace(/-/g, "")
                + tenpotyakukiboubiColumn.replace(/-/g, "") + toutyakuyoteibiColumn.replace(/-/g, "") + nyukayoteibiColumn.replace(/-/g, "");

            // 禁則文字チェック
            if (!tools.checkInputChar(ipnutData)) {
                res.render("download", {
                    hattyuubangoColumn: hattyuubangoColumn,               // 画面検索項目の発注番号
                    hinbanColumn: hinbanColumn,                           // 画面検索項目の品番
                    shohincodeColumn: shohincodeColumn,                   // 画面検索項目の商品コード
                    tyakuyoteibiColumn: tyakuyoteibiColumn,               // 画面検索項目の当初着予定日
                    tenpotyakukiboubiColumn: tenpotyakukiboubiColumn,     // 画面検索項目の店舗着希望日
                    toutyakuyoteibiColumn: toutyakuyoteibiColumn,         // 画面検索項目の分納着予定日
                    nyukayoteibiColumn: nyukayoteibiColumn,               // 画面検索項目の入荷予定日
                    displayPulldown: displayPulldown,                     // 画面プルダウンのダウンロードファイル種選択
                    exttypecsv: exttypecsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                    exttypetsv: exttypetsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                    nofiletypeMsg: msg.M0016,                             // メッセージ：ファイル種類を選択していません。
                    noexttypeMsg: msg.M0010,                              // メッセージ：ファイル拡張子を選択していません。
                    displaycolumnInfo: "",                                // データ部のタイトル
                    datalist: [],                                         // 画面データ
                    currentPage: 1,                                       // 現在ページ
                    page: 0,                                              // 総ページ数
                    downloadMsg: "",                                      // ダウンロード正常メッセージ
                    loginid: req.session.sessLoginId,                     // ログインID
                    username: req.session.sessUsername,                   // タイトル部のユーザ名
                    kigyoname: req.session.sessKigyoname,                 // タイトル部の企業名
                    msg: msg.M0005,                                       // 禁則文字入力チェックエラー
                });
                return;
            };

            // データの取得SQL
            var countSearchSql = "";
            var searchSql = "";

            // データ件数カウント
            countSearchSql = "select count(1) count from (";
            countSearchSql += getSearchCondition(req);
            countSearchSql += ") as a";

            // 数量
            var searchSql = getSearchCondition(req);
            searchSql += " order by kigyocode";

            const countResult = await client.query(countSearchSql);
            count = countResult.rows[0].count;
            page = Math.ceil(count / pageSize);

            // データ部のタイトル
            var displaycolumnInfo = eval("tc.displaycolumnInfo");

            // データ部のデータ検索
            searchSql += ` LIMIT ${pageSize} OFFSET ${index}`;  // 指定ページのデータを取得
            const displayResult = await client.query(searchSql);  // データ検索
            var datalist = [];
            for (var i = 0; i < displayResult.rows.length; i++) {
                var array = [];
                array.push(index + i + 1);

                for (const [key, value] of Object.entries(displayResult.rows[i])) {
                    array.push(value);
                }

                datalist.push(array);
            }

            res.render("download", {
                hattyuubangoColumn: hattyuubangoColumn,               // 画面検索項目の発注番号
                hinbanColumn: hinbanColumn,                           // 画面検索項目の品番
                shohincodeColumn: shohincodeColumn,                   // 画面検索項目の商品コード
                tyakuyoteibiColumn: tyakuyoteibiColumn,               // 画面検索項目の当初着予定日
                tenpotyakukiboubiColumn: tenpotyakukiboubiColumn,     // 画面検索項目の店舗着希望日
                toutyakuyoteibiColumn: toutyakuyoteibiColumn,         // 画面検索項目の分納着予定日
                nyukayoteibiColumn: nyukayoteibiColumn,               // 画面検索項目の入荷予定日
                displayPulldown: displayPulldown,                     // 画面プルダウンのダウンロードファイル種選択
                exttypecsv: exttypecsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                exttypetsv: exttypetsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                nofiletypeMsg: msg.M0016,                             // メッセージ：ファイル種類を選択していません。
                noexttypeMsg: msg.M0010,                              // メッセージ：ファイル拡張子を選択していません。
                displaycolumnInfo: displaycolumnInfo,                 // データ部のタイトル
                datalist: datalist,                                   // データ部のデータ
                currentPage: currentPage,                             // 現在ページ
                page: page,                                           // 総ページ数
                downloadMsg: msg.M0008,                               // ダウンロード正常メッセージ
                loginid: req.session.sessLoginId,                     // ログインID
                username: req.session.sessUsername,                   // タイトル部のユーザ名
                kigyoname: req.session.sessKigyoname,                 // タイトル部の企業名
                msg: count + msg.M0006                                // 検索メッセージ
            });

        } catch (error) {
            writelog("ERROR", "ダウンロード画面", req.session.sessLoginId, "データ検索処理でエラーが発生しました");
            console.log(error);
            // ログイン状態を削除
            deleteLoginStatus(req);
            res.render("login", {
                msg: msg.M0017,
                loginId: ""
            })
        } finally {
            await client.release(true);
        }
    })();
});

// ダウンロード画面の「ダウンロード」ボタン
app.post('/download', check, (req, res) => {
    writelog("INFO", "ダウンロード画面", req.session.sessLoginId, "ダウンロードが実行されました");
    // 以下のHTTPレスポンスヘッダーを付与
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // 画面入力データ取得
    var postData = req.body;
    var hattyuubangoColumn = postData.hattyuubangoColumn;                 // 画面検索項目の発注番号
    var hinbanColumn = postData.hinbanColumn;                             // 画面検索項目の品番
    var shohincodeColumn = postData.shohincodeColumn;                     // 画面検索項目の商品コード
    var tyakuyoteibiColumn = postData.tyakuyoteibiColumn;                 // 画面検索項目の当初着予定日
    var tenpotyakukiboubiColumn = postData.tenpotyakukiboubiColumn;       // 画面検索項目の店舗着希望日
    var toutyakuyoteibiColumn = postData.toutyakuyoteibiColumn;           // 画面検索項目の分納着予定日
    var nyukayoteibiColumn = postData.nyukayoteibiColumn;                 // 画面検索項目の入荷予定日
    var filetype = postData.filetype;                                     // 画面プルダウンのダウンロードファイル種選択
    var exttype = postData.exttype;                                       // 画面プルダウンのダウンロードファイル拡張子選択
    var filetypeName = postData.filetypeName;                             // 画面プルダウンのダウンロードファイル種選択のテキスト
    var exttypecsv = "";
    var exttypetsv = "";
    var splitMark = "";
    var displayPulldown = [];
    var nowDate = getTime();
    var outputFilePath = "./static/download/download.tmp";                //出力ファイルパス

    var client;
    (async function () {
        try {
            // プルダウンを選択する場合
            var pullDownSelectedFlg = true;

            // プルダウンの表示項目取得
            client = await pool.connect();
            var pulldownSql = "select tableid, filename from m006 where screenid = '2' order by hyouzizyun";
            const result = await client.query(pulldownSql);
            for (var i = 0; i < result.rows.length; i++) {
                var displayRowData = [];
                var tableid = result.rows[i].tableid.trim();
                displayRowData.push(tableid);
                displayRowData.push(result.rows[i].filename.trim());
                if (filetype == tableid) {
                    displayRowData.push("selected");
                    pullDownSelectedFlg = false;
                } else {
                    displayRowData.push("");
                }
                displayPulldown.push(displayRowData);
            }

            // プルダウンを選択しない場合
            if (pullDownSelectedFlg) {
                // エラー情報
                writelog("ERROR", "ダウンロード画面", req.session.sessLoginId, "ファイル種類を選択していません");
                message.push(msg.M0017);
                res.render("download", {
                    hattyuubangoColumn: hattyuubangoColumn,               // 画面検索項目の発注番号
                    hinbanColumn: hinbanColumn,                           // 画面検索項目の品番
                    shohincodeColumn: shohincodeColumn,                   // 画面検索項目の商品コード
                    tyakuyoteibiColumn: tyakuyoteibiColumn,               // 画面検索項目の当初着予定日
                    tenpotyakukiboubiColumn: tenpotyakukiboubiColumn,     // 画面検索項目の店舗着希望日
                    toutyakuyoteibiColumn: toutyakuyoteibiColumn,         // 画面検索項目の分納着予定日
                    nyukayoteibiColumn: nyukayoteibiColumn,               // 画面検索項目の入荷予定日
                    displayPulldown: displayPulldown,                     // 画面プルダウンのダウンロードファイル種選択
                    exttypecsv: exttypecsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                    exttypetsv: exttypetsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                    nofiletypeMsg: msg.M0016,                             // メッセージ：ファイル種類を選択していません。
                    noexttypeMsg: msg.M0010,                              // メッセージ：ファイル拡張子を選択していません。
                    displaycolumnInfo: "",                                // データ部のタイトル
                    datalist: [],                                         // 画面データ
                    currentPage: 1,                                       // 現在ページ
                    page: 0,                                              // 総ページ数
                    downloadMsg: msg.M0008,                               // ダウンロード正常メッセージ
                    loginid: req.session.sessLoginId,                     // ログインID
                    username: req.session.sessUsername,                   // タイトル部のユーザ名
                    kigyoname: req.session.sessKigyoname,                 // タイトル部の企業名
                    msg: msg.M0016,                                       // ファイル種類を選択していません。
                });
                return;
            }

            // csvを選択する場合
            if (exttype == "csv") {
                exttypecsv = "selected";
                splitMark = commaMark;
                // tsvを選択する場合
            } else if (exttype == "tsv") {
                exttypetsv = "selected";
                splitMark = tabMark;
                // 店別配分結果（SAN）を選択する場合
            } else {
                // エラー情報
                writelog("ERROR", "ダウンロード画面", req.session.sessLoginId, "ファイル拡張子を選択していません");
                res.render("download", {
                    hattyuubangoColumn: hattyuubangoColumn,               // 画面検索項目の発注番号
                    hinbanColumn: hinbanColumn,                           // 画面検索項目の品番
                    shohincodeColumn: shohincodeColumn,                   // 画面検索項目の商品コード
                    tyakuyoteibiColumn: tyakuyoteibiColumn,               // 画面検索項目の当初着予定日
                    tenpotyakukiboubiColumn: tenpotyakukiboubiColumn,     // 画面検索項目の店舗着希望日
                    toutyakuyoteibiColumn: toutyakuyoteibiColumn,         // 画面検索項目の分納着予定日
                    nyukayoteibiColumn: nyukayoteibiColumn,               // 画面検索項目の入荷予定日
                    filetypet001: filetypet001,                           // 画面プルダウンのダウンロードファイル種選択
                    filetypet002: filetypet002,                           // 画面プルダウンのダウンロードファイル種選択
                    filetypet003: filetypet003,                           // 画面プルダウンのダウンロードファイル種選択
                    exttypecsv: exttypecsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                    exttypetsv: exttypetsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                    nofiletypeMsg: msg.M0016,                             // メッセージ：ファイル種類を選択していません。
                    noexttypeMsg: msg.M0010,                              // メッセージ：ファイル拡張子を選択していません。
                    displaycolumnInfo: "",                                // データ部のタイトル
                    datalist: [],                                         // 画面データ
                    currentPage: 1,                                       // 現在ページ
                    page: 0,                                              // 総ページ数
                    downloadMsg: msg.M0008,                               // ダウンロード正常メッセージ
                    loginid: req.session.sessLoginId,                     // ログインID
                    username: req.session.sessUsername,                   // タイトル部のユーザ名
                    kigyoname: req.session.sessKigyoname,                 // タイトル部の企業名
                    msg: msg.M0010,                                       // ファイル拡張子を選択していません。
                });
                return;
            }

            var searchSql = "";
            // データ検索
            searchSql = "select ";
            searchSql += getOutputColumn(filetype);
            searchSql += " from " + filetype.replace("PO", "");
            searchSql += " where kigyocode in (" + req.session.sessKengenkigyocodeView + ") ";
            searchSql += " or " + "butsuryuuitakusakicode in (" + req.session.sessKengenkigyocodeView + ")";

            // データ部のタイトル
            const allDataResult = await client.query(searchSql);
            var datalist = allDataResult.rows;

            // 出力ファイルデータの作成
            var line = "";

            // downloadファイルのタイトル
            var displaycolumnInfo = eval("tc.outputfiletitle" + filetype);
            for (var i = 0; i < displaycolumnInfo.length; i++) {
                line += quotMark + displaycolumnInfo[i] + quotMark + splitMark;
            }
            line = line.slice(0, - 1);
            line += "\n";
            for (var i = 0; i < datalist.length; i++) {
                for (const [key, value] of Object.entries(datalist[i])) {
                    if (value != null && value != "") {
                        line += quotMark + value + quotMark + splitMark;
                    } else {
                        line += quotMark + quotMark + splitMark;
                    }
                }
                line = line.slice(0, - 1);
                line += "\n";
            }

            // ファイル出力とダウンロード
            fs.writeFileSync(outputFilePath, line);
            res.download(outputFilePath, filetypeName + '_' + nowDate + '.' + exttype, function (err) {
                fs.unlink(outputFilePath, (err) => { });   // ファイル削除
            });

        } catch (error) {
            writelog("ERROR", "ダウンロード画面", req.session.sessLoginId, "ダウンロードファイル作成処理でエラーが発生しました");
            console.log(error);
            res.render("download", {
                hattyuubangoColumn: hattyuubangoColumn,               // 画面検索項目の発注番号
                hinbanColumn: hinbanColumn,                           // 画面検索項目の品番
                shohincodeColumn: shohincodeColumn,                   // 画面検索項目の商品コード
                tyakuyoteibiColumn: tyakuyoteibiColumn,               // 画面検索項目の当初着予定日
                tenpotyakukiboubiColumn: tenpotyakukiboubiColumn,     // 画面検索項目の店舗着希望日
                toutyakuyoteibiColumn: toutyakuyoteibiColumn,         // 画面検索項目の分納着予定日
                nyukayoteibiColumn: nyukayoteibiColumn,               // 画面検索項目の入荷予定日
                displayPulldown: displayPulldown,                     // 画面プルダウンのダウンロードファイル種選択
                exttypecsv: exttypecsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                exttypetsv: exttypetsv,                               // 画面プルダウンのダウンロードファイル拡張子選択
                nofiletypeMsg: msg.M0016,                             // メッセージ：ファイル種類を選択していません。
                noexttypeMsg: msg.M0010,                              // メッセージ：ファイル拡張子を選択していません。
                displaycolumnInfo: "",                                // データ部のタイトル
                datalist: "",                                         // 画面表示データ
                currentPage: 1,                                       // 現在ページ
                page: 0,                                              // 総ページ数
                downloadMsg: msg.M0008,                               // ダウンロード正常メッセージ
                loginid: req.session.sessLoginId,                     // ログインID
                username: req.session.sessUsername,                   // タイトル部のユーザ名
                kigyoname: req.session.sessKigyoname,                 // タイトル部の企業名
                msg: msg.M0007                                        // downloadメッセージ
            });
        } finally {
            await client.release(true);
        }
    })();
});

// メインエリアの「ログアウト」ボタン
app.get("/logout", (req, res) => {
    writelog("INFO", "ログアウト", req.session.sessLoginId, "ログアウトへアクセスしました");

    // ログイン状態を削除
    deleteLoginStatus(req, res);

    // ログイン画面へ遷移
    res.render("login", {
        msg: "",
        loginId: ""
    })
});

// ほかのURL
app.use((req, res, next) => {
    res.render("login", {
        msg: "",
        loginId: ""
    });
});

app.listen(8080, () => {
    var hostname = os.hostname();
    console.log("アパレル情報共有システムアプリのサービス開始 http://" + hostname + ":8080");
});

// トークンとセッションのチェック
function check(req, res, next) {
    // 秘密文字 と トークン を取得
    var secret = req.session._csrf;
    const token = getToken(req);

    // 秘密文字 と トークン の組み合わせが正しいか検証
    if (tokens.verify(secret, token) === false || !req.session.sessLoginId) {
        writelog("ERROR", req.session.sessLoginId, "セッションを切りました。");
        res.render("login", {
            msg: msg.M0009,
            loginId: ""
        });
        return;
    }
    // ログイン時間の更新
    updateLoginDate(req, res);

    next();
};

// 主キー情報の取得
function getKeyCondition(tableName, lineArray) {
    // 定義ファイルのカラム情報を取得
    var keyInfo = eval("tc.keyinfo_" + tableName);

    // 検索条件の作成
    var searchCondition = " where ";
    for (var i = 0; i < keyInfo.length; i++) {
        searchCondition = searchCondition + keyInfo[i][0] + " = '" + lineArray[keyInfo[i][1]] + "'";
        if (i < keyInfo.length - 1) {
            searchCondition = searchCondition + " and ";
        }
    }
    return searchCondition;
}

// insertSQL文の取得
function getInsertSql(tableName, lineArray, req) {
    // 定義ファイルのカラム情報を取得
    var columnInfo = eval("tc." + tableName);

    // insertのカラム
    var insertColumn = "";
    // insertの値
    var insertData = "";
    for (var i = 0; i < columnInfo.length; i++) {
        insertColumn = insertColumn + columnInfo[i][0];
        if (lineArray[columnInfo[i][1]] != null || lineArray[columnInfo[i][1]] != "") {
            // 不正文字の無効
            if (columnInfo[i][7] == 1) {
                insertData = insertData + "'" + tools.htmlspecialchars(lineArray[columnInfo[i][1]]) + "'";
            } else {
                insertData = insertData + "'" + lineArray[columnInfo[i][1]] + "'";
            }
        } else {
            insertData = insertData + null;
        }
        insertColumn = insertColumn + ", ";
        insertData = insertData + ", ";
    }
    insertColumn = insertColumn + "tourokushashozokukigyocode, sipflag, torokubi, torokushaid, koshinbi, koshinsyaid"

    // 登録者所属企業コード
    insertData = insertData + "'" + req.session.sessShozokukigyocode + "', ";
    // SIP基盤連携済みフラグ
    insertData = insertData + "'0', ";
    // 登録日
    insertData = insertData + "now(), ";
    // 登録者ID
    insertData = insertData + "'" + req.session.sessLoginId + "', ";
    // 更新日
    insertData = insertData + "now(), ";
    // 更新者ID
    insertData = insertData + "'" + req.session.sessLoginId + "'";

    var insertSql = `insert into ${tableName} (${insertColumn}) values (${insertData})`;
    return insertSql;
}

// updateSQL文の取得
function getUpdateSql(tableName, lineArray, searchCondition, req) {
    // 定義ファイルのカラム情報を取得
    var columnInfo = eval("tc." + tableName);

    // updateSQL文の作成
    var updateColumn = "";
    for (var i = 0; i < columnInfo.length; i++) {
        if (lineArray[columnInfo[i][1]] != null || lineArray[columnInfo[i][1]] != "") {
            // 不正文字の無効
            if (columnInfo[i][7] == 1) {
                updateColumn = updateColumn + columnInfo[i][0] + "=" + "'" + tools.htmlspecialchars(lineArray[columnInfo[i][1]]) + "'";
            } else {
                updateColumn = updateColumn + columnInfo[i][0] + "=" + "'" + lineArray[columnInfo[i][1]] + "'";
            }
        } else {
            updateColumn = updateColumn + columnInfo[i][0] + "=" + null;
        }
        updateColumn = updateColumn + ", ";
    }

    // 登録者所属企業コード
    updateColumn = updateColumn + "tourokushashozokukigyocode = '" + req.session.sessShozokukigyocode + "', ";
    // 更新日
    updateColumn = updateColumn + "koshinbi = now(), ";
    // 更新者ID
    updateColumn = updateColumn + "koshinsyaid = '" + req.session.sessLoginId + "' ";

    var updateSql = `update ${tableName} set ${updateColumn} ${searchCondition}`;
    return updateSql;
}

// 検索項目の作成
function getOutputColumn(targetTable) {
    var getColumn = "";
    var outputfilecolum = eval("tc.outputfilecolumn" + targetTable);
    for (var i = 0; i < outputfilecolum.length; i++) {
        var columnId = outputfilecolum[i];
        getColumn += columnId + ",";
    }
    getColumn = getColumn.slice(0, - 1);
    return getColumn;
}

// 検索条件の作成
function getSearchCondition(req) {
    var postData = req.body;
    var hattyuubangoColumn = postData.hattyuubangoColumn;                 // 画面検索項目の発注番号
    var hinbanColumn = postData.hinbanColumn;                             // 画面検索項目の品番
    var shohincodeColumn = postData.shohincodeColumn;                     // 画面検索項目の商品コード
    var tyakuyoteibiColumn = postData.tyakuyoteibiColumn;                 // 画面検索項目の当初着予定日
    var tenpotyakukiboubiColumn = postData.tenpotyakukiboubiColumn;       // 画面検索項目の店舗着希望日
    var toutyakuyoteibiColumn = postData.toutyakuyoteibiColumn;           // 画面検索項目の分納着予定日
    var nyukayoteibiColumn = postData.nyukayoteibiColumn;                 // 画面検索項目の入荷予定日

    // データ検索
    searchSql = "select ";
    searchSql += "m003.kigyocode                as kigyocode                   , ";                         // 企業コード
    searchSql += "m003.shohincode               as shohincode                  , ";                         // 商品コード
    searchSql += "m003.syohincode_dokuji        as syohincode_dokuji           , ";                         // 商品コード（独自）
    searchSql += "m003.syohincode_dokuji_edaban as syohincode_dokuji_edaban    , ";                         // 商品コード（独自枝番）
    searchSql += "m003.brandcode                as brandcode                   , ";                         // ブランドコード
    searchSql += "m003.brandname                as brandname                   , ";                         // ブランド名
    searchSql += "m003.hinban                   as hinban                      , ";                         // 品番
    searchSql += "m003.colorcode                as colorcode                   , ";                         // カラーコード
    searchSql += "m003.colorname                as colorname                   , ";                         // カラー名
    searchSql += "m003.sizecode                 as sizecode                    , ";                         // サイズコード
    searchSql += "m003.sizename                 as sizename                    , ";                         // サイズ名
    searchSql += "m003.nisugatacode             as nisugatacode                , ";                         // 荷姿コード
    searchSql += "m003.nisugataname             as nisugataname                , ";                         // 荷姿名
    searchSql += "t001.hattyuubango             as hattyuubango                , ";                         // 発注番号
    searchSql += "t001.hattyuubango_edaban      as hattyuubango_edaban         , ";                         // 発注番号（枝番）
    searchSql += "t001.hattyuumeisaibango       as hattyuumeisaibango          , ";                         // 発注明細番号
    searchSql += "t001.bunnoubango              as bunnoubango                 , ";                         // 分納番号
    searchSql += "t001.butsuryuuitakusakicode   as butsuryuuitakusakicode      , ";                         // 物流委託先コード
    searchSql += "t002.scmrenkeibango           as scmrenkeibango              , ";                         // scm連携番号
    searchSql += "t001.hattyusakiname           as hattyusakiname              , ";                         // 発注先名
    searchSql += "t001.hattyusakicode           as hattyusakicode              , ";                         // 発注先コード
    searchSql += "t001.tosyoyoteisuuryo         as tosyoyoteisuuryo            , ";                         // 当初予定数量
    searchSql += "to_char(t001.tousyotyakuyoteibi, 'yyyy/mm/dd') as tousyotyakuyoteibi, ";                  // 当初着予定日
    searchSql += "t001.bunnnousuuryo            as bunnnousuuryo               , ";                         // 分納数量
    searchSql += "to_char(t001.bunnnoutyakuyoteibi, 'yyyy/mm/dd') as bunnnoutyakuyoteibi, ";                // 分納着予定日
    searchSql += "t002.tenpocode                as t002tenpocode               , ";                         // 店舗コード
    searchSql += "t002.suuryo                   as t002suuryo                  , ";                         // 数量
    searchSql += "to_char(t002.tenpotyakukiboubi, 'yyyy/mm/dd') as tenpotyakukiboubi, ";                    // 店舗着希望日
    searchSql += "t003.tenpocode                as t003tenpocode               , ";                         // 店舗コード
    searchSql += "to_char(t003.nyukayoteibi, 'yyyy/mm/dd') as nyukayoteibi     , ";                         // 入荷予定日
    searchSql += "t003.konpobango as konpobango                                , ";                         // 梱包番号
    searchSql += "t003.suuryo                   as t003suuryo                    ";
    searchSql += " from m003";                                               // 商品マスタ
    searchSql += " left join t001 on m003.kigyocode = t001.kigyocode";       // 発注計画
    searchSql += " and m003.hinban = t001.hinban";
    searchSql += " and m003.colorcode = t001.colorcode";
    searchSql += " and m003.sizecode = t001.sizecode";
    searchSql += " left join t002 on m003.kigyocode = t002.kigyocode";       // 配分指示
    searchSql += " and m003.hinban = t002.hinban";
    searchSql += " and m003.colorcode = t002.colorcode";
    searchSql += " and m003.sizecode = t002.sizecode";
    searchSql += " left join t003 on m003.kigyocode = t003.kigyocode";       // 配分結果(ASN）
    searchSql += " and m003.hinban = t003.hinban";
    searchSql += " and m003.colorcode = t003.colorcode";
    searchSql += " and m003.sizecode = t003.sizecode";
    searchSql += " where m003.shohincode is not null";                       // 商品コードはnullじゃない
    if (req.session.sessKengenkigyocodeView != null && req.session.sessKengenkigyocodeView != "") {
        searchSql += " and m003.kigyocode in (" + req.session.sessKengenkigyocodeView + ") ";  // 参照権限
    } else {
        searchSql += " and false ";
    }
    // 商品コード
    if (shohincodeColumn != null && shohincodeColumn != "") {
        searchSql += " and m003.shohincode = '" + shohincodeColumn + "'";
    }
    // 発注番号
    if (hattyuubangoColumn != null && hattyuubangoColumn != "") {
        searchSql += " and t001.hattyuubango = '" + hattyuubangoColumn + "'";
    }
    // 品番
    if (hinbanColumn != null && hinbanColumn != "") {
        searchSql += " and m003.hinban = '" + hinbanColumn + "'";
    }
    // 当初着予定日
    if (tyakuyoteibiColumn != null && tyakuyoteibiColumn != "") {
        searchSql += " and t001.tousyotyakuyoteibi = cast( '" + tyakuyoteibiColumn + "' as date)";
    }
    // 分納着予定日
    if (toutyakuyoteibiColumn != null && toutyakuyoteibiColumn != "") {
        searchSql += " and t001.bunnnoutyakuyoteibi = cast( '" + toutyakuyoteibiColumn + "' as date)";
    }
    // 店舗着希望日
    if (tenpotyakukiboubiColumn != null && tenpotyakukiboubiColumn != "") {
        searchSql += " and t002.tenpotyakukiboubi = cast( '" + tenpotyakukiboubiColumn + "' as date)";
    }
    // 入荷予定日
    if (nyukayoteibiColumn != null && nyukayoteibiColumn != "") {
        searchSql += " and t003.nyukayoteibi = cast( '" + nyukayoteibiColumn + "' as date)";
    }
    searchSql += " union ";
    searchSql += "select ";                                            // 商品コードがないデータ取得
    searchSql += "m003.kigyocode                as kigyocode                   , ";                         // 企業コード
    searchSql += "m003.shohincode               as shohincode                  , ";                         // 商品コード
    searchSql += "m003.syohincode_dokuji        as syohincode_dokuji           , ";                         // 商品コード（独自）
    searchSql += "m003.syohincode_dokuji_edaban as syohincode_dokuji_edaban    , ";                         // 商品コード（独自枝番）
    searchSql += "m003.brandcode                as brandcode                   , ";                         // ブランドコード
    searchSql += "m003.brandname                as brandname                   , ";                         // ブランド名
    searchSql += "m003.hinban                   as hinban                      , ";                         // 品番
    searchSql += "m003.colorcode                as colorcode                   , ";                         // カラーコード
    searchSql += "m003.colorname                as colorname                   , ";                         // カラー名
    searchSql += "m003.sizecode                 as sizecode                    , ";                         // サイズコード
    searchSql += "m003.sizename                 as sizename                    , ";                         // サイズ名
    searchSql += "m003.nisugatacode             as nisugatacode                , ";                         // 荷姿コード
    searchSql += "m003.nisugataname             as nisugataname                , ";                         // 荷姿名
    searchSql += "t001.hattyuubango             as hattyuubango                , ";                         // 発注番号
    searchSql += "t001.hattyuubango_edaban      as hattyuubango_edaban         , ";                         // 発注番号（枝番）
    searchSql += "t001.hattyuumeisaibango       as hattyuumeisaibango          , ";                         // 発注明細番号
    searchSql += "t001.bunnoubango              as bunnoubango                 , ";                         // 分納番号
    searchSql += "t001.butsuryuuitakusakicode   as butsuryuuitakusakicode      , ";                         // 物流委託先コード
    searchSql += "t002.scmrenkeibango           as scmrenkeibango              , ";                         // scm連携番号
    searchSql += "t001.hattyusakiname           as hattyusakiname              , ";                         // 発注先名
    searchSql += "t001.hattyusakicode           as hattyusakicode              , ";                         // 発注先コード
    searchSql += "t001.tosyoyoteisuuryo         as tosyoyoteisuuryo            , ";                         // 当初予定数量
    searchSql += "to_char(t001.tousyotyakuyoteibi, 'yyyy/mm/dd') as tousyotyakuyoteibi, ";                  // 当初着予定日
    searchSql += "t001.bunnnousuuryo            as bunnnousuuryo               , ";                         // 分納数量
    searchSql += "to_char(t001.bunnnoutyakuyoteibi, 'yyyy/mm/dd') as bunnnoutyakuyoteibi, ";                // 分納着予定日
    searchSql += "t002.tenpocode                as t002tenpocode               , ";                         // 店舗コード
    searchSql += "t002.suuryo                   as t002suuryo                  , ";                         // 数量
    searchSql += "to_char(t002.tenpotyakukiboubi, 'yyyy/mm/dd') as tenpotyakukiboubi, ";                    // 店舗着希望日
    searchSql += "t003.tenpocode                as t003tenpocode               , ";                         // 店舗コード
    searchSql += "to_char(t003.nyukayoteibi, 'yyyy/mm/dd') as nyukayoteibi     , ";                         // 入荷予定日
    searchSql += "t003.konpobango               as konpobango                  , ";                         // 梱包番号
    searchSql += "t003.suuryo                   as t003suuryo                    ";
    searchSql += " from m003";                                               // 商品マスタ
    searchSql += " left join t001 on m003.kigyocode = t001.kigyocode";       // 発注計画
    searchSql += " and m003.syohincode_dokuji = t001.syohincode_dokuji";
    searchSql += " and m003.syohincode_dokuji_edaban = t001.syohincode_dokuji_edaban";
    searchSql += " left join t002 on m003.kigyocode = t002.kigyocode";       // 配分指示
    searchSql += " and m003.hinban = t002.hinban";
    searchSql += " and m003.colorcode = t002.colorcode";
    searchSql += " and m003.sizecode = t002.sizecode";
    searchSql += " left join t003 on m003.kigyocode = t003.kigyocode";       // 配分結果(ASN）
    searchSql += " and m003.hinban = t003.hinban";
    searchSql += " and m003.colorcode = t003.colorcode";
    searchSql += " and m003.sizecode = t003.sizecode";
    searchSql += " where m003.shohincode is null";                         // 商品コードはnullじゃない
    if (req.session.sessKengenkigyocodeView != null && req.session.sessKengenkigyocodeView != "") {
        searchSql += " and m003.kigyocode in (" + req.session.sessKengenkigyocodeView + ") ";  // 参照権限
    } else {
        searchSql += " and false ";
    }
    // 商品コード
    if (shohincodeColumn != null && shohincodeColumn != "") {
        searchSql += " and m003.syohincode_dokuji = '" + shohincodeColumn + "'";
    }
    // 発注番号
    if (hattyuubangoColumn != null && hattyuubangoColumn != "") {
        searchSql += " and t001.hattyuubango = '" + hattyuubangoColumn + "'";
    }
    // 品番
    if (hinbanColumn != null && hinbanColumn != "") {
        searchSql += " and m003.hinban = '" + hinbanColumn + "'";
    }
    // 当初着予定日
    if (tyakuyoteibiColumn != null && tyakuyoteibiColumn != "") {
        searchSql += " and t001.tousyotyakuyoteibi = cast( '" + tyakuyoteibiColumn + "' as date)";
    }
    // 分納着予定日
    if (toutyakuyoteibiColumn != null && toutyakuyoteibiColumn != "") {
        searchSql += " and t001.bunnnoutyakuyoteibi = cast( '" + toutyakuyoteibiColumn + "' as date)";
    }
    // 店舗着希望日
    if (tenpotyakukiboubiColumn != null && tenpotyakukiboubiColumn != "") {
        searchSql += " and t002.tenpotyakukiboubi = cast( '" + tenpotyakukiboubiColumn + "' as date)";
    }
    // 入荷予定日
    if (nyukayoteibiColumn != null && nyukayoteibiColumn != "") {
        searchSql += " and t003.nyukayoteibi = cast( '" + nyukayoteibiColumn + "' as date)";
    }

    return searchSql;
}

// 日時の取得
function getTime() {
    var date = new Date();
    var year = date.getFullYear();      // 年
    var month = date.getMonth() + 1;    // 月
    if (month < 10) {
        month = "0" + month;
    }
    var day = date.getDate();           // 日
    if (day < 10) {
        day = "0" + day;
    }
    var hour = date.getHours();         // 時
    if (hour < 10) {
        hour = "0" + hour;
    }
    var minutes = date.getMinutes();    // 分
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    var seconds = date.getSeconds();    // 秒
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var nowDate = year + month + day + underscoreMark + hour + minutes + seconds;
    return nowDate;
}

// ログ出力
function writelog(level, screenName, loginId, msg) {
    var log = "［”" + getTime() + ",　" + level + ",　" + screenName + ",　" + loginId + "”］　" + msg;
    console.log(log);
}

// tokenの取得
function getToken(req) {
    const cookieData = req.headers.cookie !== undefined ? req.headers.cookie : '';
    const datas = cookieData.split(';').map(data => data.trim());
    const tokenKeyValue = datas.find(data => data.startsWith('token='));
    var token = "";
    if (tokenKeyValue) {
        token = tokenKeyValue.replace('token=', '');
    }
    return token;
}

// 2重ログイン制御のため、ログイン日付の更新
function updateLoginDate(req, res) {
    var client;
    (async function () {
        try {
            client = await pool.connect();
            var updateSql = "update m001 set koshinbi = now() where userid = '" + req.session.sessLoginId + "'";
            await client.query(updateSql);
        } catch (error) {
            console.log(error);
            // ログイン状態を削除
            deleteLoginStatus(req, res);
            res.render("login", {
                msg: msg.M0017,
                loginId: ""
            });
        } finally {
            await client.release(true);
        }
    })();
}

// 2重ログイン制御のため、ログイン状態の削除
function deleteLoginStatus(req, res) {
    var client;
    (async function () {
        try {
            client = await pool.connect();
            var updateSql = "update m001 set loginstatus = '00' where userid = '" + req.session.sessLoginId + "'"; await pool.query(updateSql);
            await client.query(updateSql);

            // セッションを切る
            req.session.destroy();
        } catch (error) {
            console.log(error);
            // セッションを切る
            req.session.destroy();
            res.render("login", {
                msg: msg.M0017,
                loginId: ""
            });
        } finally {
            await client.release(true);
        }
    })();
}

// 2重ログイン制御のため、ログイン状態の更新
function updateLoginStatus(res, loginId) {
    var client;
    (async function () {
        try {
            client = await pool.connect();
            var updateSql = "update m001 set loginstatus = '01', koshinbi = now() where userid = '" + loginId + "'";
            await client.query(updateSql);
        } catch (error) {
            console.log(error);
            // ログイン状態を削除
            deleteLoginStatus(req, res);
            res.render("login", {
                msg: msg.M0017,
                loginId: ""
            });
        } finally {
            await client.release(true);
        }
    })();
}
