module.exports = {
    // uploadファイルの項目のチェックの定義

    // ------ 発注計画のカラム情報 start    ----------------
    // [カラム名, 
    // ファイルの位置, 
    // nullチェック（0：チェックしない 1：チェック）, 
    // 英数字チェック（0：チェックしない 1：チェック）, 
    // 数字チェック（0：チェックしない 1：チェック）, 
    // 日付チェック（0：チェックしない 1：チェック）, 
    // 桁数チェック（0：チェックしない 1：チェック）-桁数, 
    // 不正文字チェック（0：チェックしない 1：チェック）
    // 相関チェック（0：チェックしない 1：チェック）-テーブル名-カラム名]
    t001: [
        ["kigyocode", 0, 1, 1, 0, 0, "1-13", 0, "1-m002-kigyocode"],                                  // 企業コード
        ["hattyusakiname", 2, 0, 0, 0, 0, "1-320", 1, "0"],                                           // 発注先名
        ["hattyusakicode", 1, 0, 1, 0, 0, "1-17", 0, "0"],                                            // 発注先コード
        ["shohincode", 3, 0, 1, 0, 0, "1-14", 0, "1-m003-shohincode"],                                // 商品コード
        ["syohincode_dokuji", 4, 0, 1, 0, 0, "1-20", 0, "1-m003-syohincode_dokuji"],                  // 商品コード（独自）
        ["syohincode_dokuji_edaban", 5, 0, 1, 0, 0, "1-20", 0, "1-m003-syohincode_dokuji_edaban"],    // 商品コード（独自枝番）
        ["brandcode", 6, 0, 1, 0, 0, "1-10", 0, "0"],                                                 // ブランドコード
        ["hinban", 7, 0, 1, 0, 0, "1-20", 0, "1-m003-hinban"],                                        // 品番
        ["colorcode", 8, 0, 1, 0, 0, "1-3", 0, "1-m003-colorcode"],                                   // カラーコード
        ["sizecode", 9, 0, 1, 0, 0, "1-3", 0, "1-m003-sizecode"],                                     // サイズコード
        ["colorname", 10, 0, 0, 0, 0, "1-20", 1, "0"],                                                // カラー名
        ["sizename", 11, 0, 0, 0, 0, "1-20", 1, "0"],                                                 // サイズ名
        ["hattyuubango", 12, 1, 1, 0, 0, "1-23", 0, "0"],                                             // 発注番号
        ["hattyuubango_edaban", 13, 0, 1, 0, 0, "1-10", 0, "0"],                                      // 発注番号（枝番）
        ["hattyuumeisaibango", 14, 0, 1, 0, 0, "1-20", 0, "0"],                                       // 発注明細番号
        ["butsuryuuitakusakicode", 22, 0, 1, 0, 0, "1-13", 0, "0"],                                   // 物流委託先コード
        ["nisugatacode", 15, 0, 1, 0, 0, "1-3", 0, "0"],                                              // 荷姿コード
        ["nisugataname", 16, 0, 0, 0, 0, "1-20", 1, "0"],                                             // 荷姿名
        ["tosyoyoteisuuryo", 17, 0, 0, 1, 0, "1-11", 0, "0"],                                         // 当初予定数量
        ["tousyotyakuyoteibi", 18, 0, 0, 0, 1, "1-10", 0, "0"],                                       // 当初着予定日
        ["bunnoubango", 19, 0, 0, 1, 0, "1-11", 0, "0"],                                              // 分納番号
        ["bunnnousuuryo", 20, 0, 0, 1, 0, "1-11", 0, "0"],                                            // 分納数量
        ["bunnnoutyakuyoteibi", 21, 0, 0, 0, 1, "1-10", 0, "0"]                                       // 分納着予定日
    ],
    keyinfo_t001: [
        ["kigyocode", 0],                                               // 企業コード
        ["shohincode", 3],                                              // 商品コード
        ["syohincode_dokuji", 4],                                       // 商品コード（独自）
        ["syohincode_dokuji_edaban", 5],                                // 商品コード（独自枝番）
        ["hinban", 7],                                                  // 品番
        ["colorcode", 8],                                               // カラーコード
        ["sizecode", 9],                                                // サイズコード
        ["hattyuubango", 12],                                           // 発注番号
        ["hattyuumeisaibango", 14],                                     // 発注明細番号
        ["bunnoubango", 19]                                             // 分納番号
    ],
    kengeninfo_t001: [["kigyocode", 0], ["butsuryuuitakusakicode", 22]],
    // ------ 発注計画のカラム情報 end    ----------------

    // ------ 配分指示のカラム情報 start    ----------------
    // [カラム名, 
    // ファイルの位置, 
    // nullチェック（0：チェックしない 1：チェック）, 
    // 英数字チェック（0：チェックしない 1：チェック）, 
    // 数字チェック（0：チェックしない 1：チェック）, 
    // 日付チェック（0：チェックしない 1：チェック）, 
    // 桁数チェック（0：チェックしない 1：チェック）-桁数, 
    // 不正文字チェック（0：チェックしない 1：チェック）
    // 相関チェック（0：チェックしない 1：チェック）-テーブル名-カラム名]
    t002: [
        ["kigyocode", 0, 1, 1, 0, 0, "1-13", 0, "1-m002-kigyocode"],    // 企業コード
        ["tenpocode", 16, 1, 1, 0, 0, "1-17", 0, "1-m004-tenpocode"],   // 店舗コード
        ["tenpouribamei", 1, 0, 0, 0, 0, "1-320", 1, "0"],              // 店舗＿売り場名
        ["shohincode", 2, 0, 1, 0, 0, "1-14", 0, "1-m003-shohincode"],  // 商品コード
        ["bunnoubango", 3, 0, 0, 1, 0, "1-11", 0, "0"],                 // 分納番号
        ["scmrenkeibango", 4, 0, 0, 1, 0, "1-11", 0, "0"],              // scm連携番号
        ["brandcode", 5, 0, 1, 0, 0, "1-10", 0, "0"],                   // ブランドコード
        ["hinban", 6, 1, 1, 0, 0, "1-20", 0, "1-m003-hinban"],          // 品番
        ["colorname", 9, 0, 0, 0, 0, "1-20", 1, "0"],                   // カラー名
        ["colorcode", 7, 1, 1, 0, 0, "1-3", 0, "1-m003-colorcode"],     // カラーコード
        ["sizename", 10, 0, 0, 0, 0, "1-20", 1, "0"],                   // サイズ名
        ["sizecode", 8, 1, 1, 0, 0, "1-2", 0, "1-m003-sizecode"],       // サイズコード
        ["nisugatacode", 14, 0, 1, 0, 0, "1-3", 0, "0"],                // 荷姿コード
        ["nisugataname", 15, 0, 0, 0, 0, "1-20", 1, "0"],               // 荷姿名
        ["suuryo", 13, 1, 0, 1, 0, "1-11", 0, "0"],                     // 数量
        ["tenpotyakukiboubi", 18, 0, 0, 0, 1, "1-10", 0, "0"],          // 店舗着希望日
        ["hattyuubango", 11, 1, 1, 0, 0, "1-23", 0, "0"],               // 発注番号
        ["hattyuubango_edaban", 12, 0, 1, 0, 0, "1-10", 0, "0"],        // 発注番号（枝番）
        ["butsuryuuitakusakicode", 17, 0, 1, 0, 0, "1-13", 0, "0"]      // 物流委託先コード
    ],
    keyinfo_t002: [
        ["kigyocode", 0],            // 企業コード
        ["shohincode", 2],           // 商品コード
        ["bunnoubango", 3],          // 分納番号
        ["scmrenkeibango", 4],       // scm連携番号
        ["brandcode", 5],            // ブランドコード
        ["hinban", 6],               // 品番
        ["colorcode", 7],            // カラーコード
        ["sizecode", 8],             // サイズコード
        ["hattyuubango", 11]         // 発注番号
    ],
    kengeninfo_t002: [["kigyocode", 0], ["butsuryuuitakusakicode", 17]],
    // ------ 配分指示のカラム情報 end    ----------------

    // ------ 配分結果のカラム情報 start    ----------------
    // [カラム名, 
    // ファイルの位置, 
    // nullチェック（0：チェックしない 1：チェック）, 
    // 英数字チェック（0：チェックしない 1：チェック）, 
    // 数字チェック（0：チェックしない 1：チェック）, 
    // 日付チェック（0：チェックしない 1：チェック）, 
    // 桁数チェック（0：チェックしない 1：チェック）-桁数, 
    // 不正文字チェック（0：チェックしない 1：チェック）
    // 相関チェック（0：チェックしない 1：チェック）-テーブル名-カラム名]
    t003: [
        ["kigyocode", 0, 1, 1, 0, 0, "1-13", 0, "1-m002-kigyocode"],    // 企業コード
        ["tenpocode", 17, 1, 1, 0, 0, "1-17", 0, "1-m004-tenpocode"],   // 店舗コード
        ["tenpouribamei", 1, 0, 0, 0, 0, "1-320", 1, "0"],              // 店舗＿売り場名
        ["nyukayoteibi", 2, 0, 0, 0, 1, "1-10", 0, "0"],                // 入荷予定日
        ["konpobango", 3, 0, 1, 0, 0, "1-23", 0, "0"],                  // 梱包番号
        ["shohincode", 4, 0, 1, 0, 0, "1-14", 0, "1-m003-shohincode"],  // 商品コード
        ["scmrenkeibango", 5, 0, 0, 1, 0, "1-11", 0, "0"],              // scm連携番号
        ["brandcode", 6, 0, 1, 0, 0, "1-10", 0, "0"],                   // ブランドコード
        ["hinban", 7, 1, 1, 0, 0, "1-20", 0, "1-m003-hinban"],          // 品番
        ["colorname", 9, 0, 0, 0, 0, "1-20", 1, "0"],                   // カラー名
        ["colorcode", 8, 1, 1, 0, 0, "1-3", 0, "1-m003-colorcode"],     // カラーコード
        ["sizename", 11, 0, 0, 0, 0, "1-20", 1, "0"],                   // サイズ名
        ["sizecode", 10, 1, 1, 0, 0, "1-2", 0, "1-m003-sizecode"],      // サイズコード
        ["nisugatacode", 15, 0, 1, 0, 0, "1-3", 0, "0"],                // 荷姿コード
        ["nisugataname", 16, 0, 0, 0, 0, "1-20", 1, "0"],               // 荷姿名
        ["suuryo", 14, 1, 0, 1, 0, "1-11", 0, "0"],                     // 数量
        ["hattyuubango", 12, 0, 1, 0, 0, "1-23", 0, "0"],               // 発注番号
        ["hattyuubango_edaban", 13, 0, 1, 0, 0, "1-10", 0, "0"],        // 発注番号（枝番）
        ["butsuryuuitakusakicode", 18, 0, 1, 0, 0, "1-13", 0, "0"]      // 物流委託先コード
    ],
    keyinfo_t003: [
        ["kigyocode", 0],               // 企業コード
        ["shohincode", 4],              // 商品コード
        ["scmrenkeibango", 5],          // scm連携番号
        ["brandcode", 6],               // ブランドコード
        ["hinban", 7],                  // 品番
        ["colorcode", 8],               // カラーコード
        ["sizecode", 10],               // サイズコード
        ["hattyuubango", 12]            // 発注番号
    ],
    kengeninfo_t003: [["kigyocode", 0], ["butsuryuuitakusakicode", 18]],
    // ------ 配分結果のカラム情報 end    ----------------

    // 検索ダウンロード画面のデータ部タイトルの定義
    displaycolumnInfo: [
        ["No."],
        ["企業コード"],
        ["商品コード"],
        ["商品コード（独自）"],
        ["商品コード（独自枝番）"],
        ["ブランドコード"],
        ["ブランド名"],
        ["品番"],
        ["カラーコード"],
        ["カラー名"],
        ["サイズコード"],
        ["サイズ名"],
        ["荷姿コード"],
        ["荷姿名"],
        ["発注番号"],
        ["発注番号（枝番）"],
        ["発注明細番号"],
        ["分納番号"],
        ["物流委託先コード"],
        ["SCM連携番号"],
        ["発注先名"],
        ["発注先コード"],
        ["当初予定数量"],
        ["当初着予定日"],
        ["分納数量"],
        ["分納着予定日"],
        ["店舗コード"],
        ["数量"],
        ["店舗着希望日"],
        ["店舗コード"],
        ["入荷予定日"],
        ["梱包番号"],
        ["数量"]
    ],

    // ダウンロードファイルに出力タイトルの定義（t001～t003）
    outputfiletitlet001: [
        "企業コード",
        "発注先コード",
        "発注先名",
        "商品コード",
        "商品コード（独自）",
        "商品コード（独自枝番）",
        "ブランドコード",
        "品番",
        "カラーコード",
        "サイズコード",
        "カラー名",
        "サイズ名",
        "発注番号",
        "発注番号（枝番）",
        "発注明細番号",
        "荷姿コード",
        "荷姿名",
        "当初予定数量",
        "当初着予定日",
        "分納番号",
        "分納数量",
        "分納着予定日",
        "物流委託先コード"
    ],
    outputfiletitlet001PO: [
        "処理区分",
        "送信連番",
        "発注セクション",
        "発注セクション名",
        "仕入先",
        "仕入先名",
        "発注番号",
        "枝番",
        "発注日付",
        "最新納品予定日",
        "JAN",
        "品番",
        "サブ１",
        "カラー",
        "サイズ",
        "備考",
        "売先",
        "発注数",
        "通貨区分",
        "在庫倉庫",
        "在庫場所",
        "納品場所",
        "倉庫グループ",
        "在庫セクション",
        "在庫セクション名",
        "諸掛種別CD",
        "諸掛種別",
        "納品形態CD",
        "納品形態",
        "出荷地CD",
        "出荷地",
        "出荷方法CD",
        "出荷方法",
        "契約先名",
        "メーカーCD",
        "メーカー",
        "CUT",
        "ETD",
        "発注担当者CD",
        "発注担当者",
        "予備文字列１",
        "予備文字列２",
        "予備文字列３",
        "予備文字列４",
        "予備数値１",
        "予備数値２",
        "予備数値３",
        "予備数値４"
    ],
    outputfiletitlet002: [
        "企業コード",
        "店舗＿売り場名",
        "商品コード",
        "分納番号",
        "SCM連携番号",
        "ブランドコード",
        "品番",
        "カラーコード",
        "サイズコード",
        "カラー名",
        "サイズ名",
        "発注番号",
        "発注番号（枝番）",
        "数量",
        "荷姿コード",
        "荷姿名",
        "店舗コード",
        "物流委託先コード",
        "店舗着希望日"
    ],
    outputfiletitlet003: [
        "企業コード",
        "店舗＿売り場名",
        "入荷予定日",
        "梱包番号",
        "商品コード",
        "SCM連携番号",
        "ブランドコード",
        "品番",
        "カラーコード",
        "カラー名",
        "サイズコード",
        "サイズ名",
        "発注番号",
        "発注番号（枝番）",
        "数量",
        "荷姿コード",
        "荷姿名",
        "店舗コード",
        "物流委託先コード"
    ],

    // ダウンロードファイルに出力カラムの定義（t001～t003）
    outputfilecolumnt001: [
        "kigyocode",                      // 企業コード
        "hattyusakicode",                 // 発注先コード
        "hattyusakiname",                 // 発注先名
        "shohincode",                     // 商品コード
        "syohincode_dokuji",              // 商品コード（独自）
        "syohincode_dokuji_edaban",       // 商品コード（独自枝番）
        "brandcode",                      // ブランドコード
        "hinban",                         // 品番
        "colorcode",                      // カラーコード
        "sizecode",                       // サイズコード
        "colorname",                      // カラー名
        "sizename",                       // サイズ名
        "hattyuubango",                   // 発注番号
        "hattyuubango_edaban",            // 発注番号（枝番）
        "hattyuumeisaibango",             // 発注明細番号
        "nisugatacode",                   // 荷姿コード
        "nisugataname",                   // 荷姿名
        "tosyoyoteisuuryo",               // 当初予定数量
        "to_char(tousyotyakuyoteibi, 'yyyy/mm/dd') as tousyotyakuyoteibi",             // 当初着予定日
        "bunnoubango",                    // 分納番号
        "bunnnousuuryo",                  // 分納数量
        "to_char(bunnnoutyakuyoteibi, 'yyyy/mm/dd') as bunnnoutyakuyoteibi",            // 分納着予定日
        "butsuryuuitakusakicode"          // 物流委託先コード
    ],
    outputfilecolumnt001PO: [
        "'' as shorikubun",                                // 処理区分
        "'' as soushinrenban",                             // 送信連番
        "'' as hattyuusection",                            // 発注セクション
        "'' as hattyuusection_name",                       // 発注セクション名
        "'' as shiiresaki",                                // 仕入先
        "'' as shiiresaki_name",                           // 仕入先名
        "hattyuubango as hattyuubango",                    // 発注番号
        "hattyuubango_edaban as hattyuubango_edaban",      // 枝番
        "'' as hattyuubi",                                 // 発注日付
        "to_char(tousyotyakuyoteibi, 'yyyy/mm/dd') as saishinnouhinyoteibi",      // 最新納品予定日
        "coalesce(shohincode, syohincode_dokuji) as syohincode",  // jan
        "hinban as hinban",                                // 品番
        "'' as sub1",                                      // サブ１
        "colorcode as color",                              // カラー
        "sizecode as size",                                // サイズ
        "'' as bikou",                                     // 備考
        "'' as urisaki",                                   // 売先
        "tosyoyoteisuuryo as hattyuusuu",                  // 発注数
        "'' as tuukakubun",                                // 通貨区分
        "'' as zaqikosouko",                               // 在庫倉庫
        "'' as zaikobasyo",                                // 在庫場所
        "'' as nouhinbasyo",                               // 納品場所
        "'' as soukogroup",                                // 倉庫グループ
        "'' as zaikosection",                              // 在庫セクション
        "'' as zaikosection_name",                         // 在庫セクション名
        "'' as shokakarisyubetucd",                        // 諸掛種別cd
        "'' as shokakarisyubetu",                          // 諸掛種別
        "nisugatacode as nouhinkeitaicd",                  // 納品形態cd
        "nisugataname as nouhinkeitai",                    // 納品形態
        "'' as syukkachicd",                               // 出荷地cd
        "'' as syukkachi",                                 // 出荷地
        "'' as syukkahouhoucd",                            // 出荷方法cd
        "'' as syukkahouhou",                              // 出荷方法
        "'' as keiyakusakiname",                           // 契約先名
        "hattyusakicode as makercd",                       // メーカーcd
        "hattyusakiname as maker",                         // メーカー
        "'' as cut",                                       // cut
        "'' as etd",                                       // etd
        "'' as hattyuutantoucd",                           // 発注担当者cd
        "'' as hattyuutantou",                             // 発注担当者
        "'' as yobimozi1",                                 // 予備文字列１
        "'' as yobimozi2",                                 // 予備文字列２
        "'' as yobimozi3",                                 // 予備文字列３
        "'' as yobimozi4",                                 // 予備文字列４
        "'' as yobisuu1",                                  // 予備数値１
        "'' as yobisuu2",                                  // 予備数値２
        "'' as yobisuu3",                                  // 予備数値３
        "'' as yobisuu4"                                   // 予備数値４
    ],
    outputfilecolumnt002: [
        "kigyocode",                      // 企業コード
        "tenpouribamei",                  // 店舗＿売り場名
        "shohincode",                     // 商品コード
        "bunnoubango",                    // 分納番号
        "scmrenkeibango",                 // scm連携番号
        "brandcode",                      // ブランドコード
        "hinban",                         // 品番
        "colorcode",                      // カラーコード
        "sizecode",                       // サイズコード
        "colorname",                      // カラー名
        "sizename",                       // サイズ名
        "hattyuubango",                   // 発注番号
        "hattyuubango_edaban",            // 発注番号（枝番）
        "suuryo",                         // 数量
        "nisugatacode",                   // 荷姿コード
        "nisugataname",                   // 荷姿名
        "tenpocode",                      // 店舗コード
        "butsuryuuitakusakicode",         // 物流委託先コード
        "to_char(tenpotyakukiboubi, 'yyyy/mm/dd') as tenpotyakukiboubi"               // 店舗着希望日
    ],
    outputfilecolumnt003: [
        "kigyocode",                      // 企業コード
        "tenpouribamei",                  // 店舗＿売り場名
        "to_char(nyukayoteibi, 'yyyy/mm/dd') as nyukayoteibi",                   // 入荷予定日
        "konpobango",                     // 梱包番号
        "shohincode",                     // 商品コード
        "scmrenkeibango",                 // scm連携番号
        "brandcode",                      // ブランドコード
        "hinban",                         // 品番
        "colorcode",                      // カラーコード
        "colorname",                      // カラー名
        "sizecode",                       // サイズコード
        "sizename",                       // サイズ名
        "hattyuubango",                   // 発注番号
        "hattyuubango_edaban",            // 発注番号（枝番）
        "suuryo",                         // 数量
        "nisugatacode",                   // 荷姿コード
        "nisugataname",                   // 荷姿名
        "tenpocode",                      // 店舗コード
        "butsuryuuitakusakicode"          // 物流委託先コード
    ],
};