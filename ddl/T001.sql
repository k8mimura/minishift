-- 発注計画テーブル定義
DROP TABLE IF EXISTS T001;
CREATE TABLE T001(
    KIGYOCODE CHARACTER (13),                                 -- 企業コード
    HATTYUSAKINAME CHARACTER VARYING (320),                   -- 発注先名
    HATTYUSAKICODE CHARACTER (17),                            -- 発注先コード
    SHOHINCODE CHARACTER VARYING (14),                        -- 商品コード
    SYOHINCODE_DOKUJI CHARACTER VARYING (20),                 -- 商品コード（独自）
    SYOHINCODE_DOKUJI_EDABAN CHARACTER VARYING (20),          -- 商品コード（独自枝番）
    BRANDCODE CHARACTER VARYING (10),                         -- ブランドコード
    HINBAN CHARACTER VARYING (20),                            -- 品番
    COLORCODE CHARACTER (3),                                  -- カラーコード
    SIZECODE CHARACTER (3),                                   -- サイズコード
    COLORNAME CHARACTER VARYING (20),                         -- カラー名
    SIZENAME CHARACTER VARYING (20),                          -- サイズ名
    HATTYUUBANGO CHARACTER VARYING (23) NOT NULL,             -- 発注番号
    HATTYUUBANGO_EDABAN CHARACTER VARYING (10),               -- 発注番号（枝番）
    HATTYUUMEISAIBANGO CHARACTER VARYING (20),                -- 発注明細番号
    BUTSURYUUITAKUSAKICODE CHARACTER (13),                    -- 物流委託先コード
    NISUGATACODE CHARACTER (3),                               -- 荷姿コード
    NISUGATANAME CHARACTER VARYING (20),                      -- 荷姿名
    TOSYOYOTEISUURYO NUMERIC (11, 0),                         -- 当初予定数量
    TOUSYOTYAKUYOTEIBI DATE,                                  -- 当初着予定日
    BUNNOUBANGO NUMERIC (11, 0),                              -- 分納番号
    BUNNNOUSUURYO NUMERIC (11, 0),                            -- 分納数量
    BUNNNOUTYAKUYOTEIBI DATE,                                 -- 分納着予定日
    TOUROKUSHASHOZOKUKIGYOCODE CHARACTER (13) NOT NULL,       -- 登録者所属企業コード
    SIPFLAG NUMERIC (1, 0),                                   -- SIP基盤連携済みフラグ
    TOROKUBI TIMESTAMP,                                       -- 登録日
    TOROKUSHAID CHARACTER (8),                                -- 登録者ID
    KOSHINBI TIMESTAMP,                                       -- 更新日
    KOSHINSYAID CHARACTER (8),                                -- 更新者ID
    UNIQUE (KIGYOCODE, SHOHINCODE, SYOHINCODE_DOKUJI, SYOHINCODE_DOKUJI_EDABAN, HINBAN, COLORCODE, SIZECODE, HATTYUUBANGO, HATTYUUMEISAIBANGO, BUNNOUBANGO)
    -- ユニークキーの組み合わせて、レコードを特定する。
);