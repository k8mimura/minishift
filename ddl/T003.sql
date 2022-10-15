-- 配分結果(ASN）テーブル定義
DROP TABLE IF EXISTS T003;
CREATE TABLE T003(
    KIGYOCODE CHARACTER (13) NOT NULL,                         -- 企業コード
    TENPOCODE CHARACTER (17) NOT NULL,                         -- 店舗コード
    TENPOURIBAMEI CHARACTER VARYING (320),                     -- 店舗＿売り場名
    NYUKAYOTEIBI DATE,                                         -- 入荷予定日
    KONPOBANGO CHARACTER VARYING (36),                         -- 梱包番号
    SHOHINCODE CHARACTER VARYING (14),                         -- 商品コード
    SCMRENKEIBANGO NUMERIC (11, 0),                            -- SCM連携番号
    BRANDCODE CHARACTER VARYING (10),                          -- ブランドコード
    HINBAN CHARACTER VARYING (20) NOT NULL,                    -- 品番
    COLORNAME CHARACTER VARYING (20),                          -- カラー名
    COLORCODE CHARACTER (3) NOT NULL,                          -- カラーコード
    SIZENAME CHARACTER VARYING (20),                           -- サイズ名
    SIZECODE CHARACTER (3) NOT NULL,                           -- サイズコード
    NISUGATACODE CHARACTER (3),                                -- 荷姿コード
    NISUGATANAME CHARACTER VARYING (20),                       -- 荷姿名
    SUURYO NUMERIC (11, 0) NOT NULL,                           -- 数量
    HATTYUUBANGO CHARACTER VARYING (23),                       -- 発注番号
    HATTYUUBANGO_EDABAN CHARACTER VARYING (10),                -- 発注番号（枝番）
    BUTSURYUUITAKUSAKICODE CHARACTER (13),                     -- 物流委託先コード
    TOUROKUSHASHOZOKUKIGYOCODE CHARACTER (13) NOT NULL,        -- 登録者所属企業コード
    SIPFLAG NUMERIC (1, 0),                                    -- SIP基盤連携済みフラグ
    TOROKUBI TIMESTAMP,                                        -- 登録日
    TOROKUSHAID CHARACTER (8),                                 -- 登録者ID
    KOSHINBI TIMESTAMP,                                        -- 更新日
    KOSHINSYAID CHARACTER (8),                                 -- 更新者ID
    UNIQUE (KIGYOCODE, SHOHINCODE, SCMRENKEIBANGO, BRANDCODE, HINBAN, COLORCODE, SIZECODE, HATTYUUBANGO)
    -- ユニークキーの組み合わせて、レコードを特定する。
);