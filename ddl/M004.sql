-- 店舗マスタテーブル定義
DROP TABLE IF EXISTS M004;
CREATE TABLE M004(
    KIGYOCODE CHARACTER(13) NOT NULL,                       -- 企業コード
    TENPOCODE CHARACTER VARYING(17) NOT NULL,               -- 店舗コード
    TENPONAME CHARACTER VARYING(320),                       -- 店舗＿売り場名
    TENPOURIBAMEI_RYAKUSHOU CHARACTER VARYING(40),          -- 店舗＿売り場名（略称）
    AREANAME CHARACTER VARYING(50),                         -- エリア名
    AREACODE CHARACTER VARYING(6),                          -- エリアコード
    YUBINBANGO CHARACTER(7),                                -- 郵便番号
    JUUSHO CHARACTER VARYING(500),                          -- 住所
    TOROKUBI TIMESTAMP,                                     -- 登録日
    TOROKUSHAID CHARACTER(8),                               -- 登録者ID
    KOSHINBI TIMESTAMP,                                     -- 更新日
    KOSHINSYAID CHARACTER(8),                               -- 更新者ID
    PRIMARY KEY (KIGYOCODE, TENPOCODE)
);
