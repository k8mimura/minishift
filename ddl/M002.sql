-- ユーザ企業マスタテーブル定義
DROP TABLE IF EXISTS M002;
CREATE TABLE M002(
    KIGYOCODE CHARACTER(13) NOT NULL,                      -- 企業コード
    KIGYONAME CHARACTER VARYING(50) NOT NULL,              -- 企業名
    HONSHAJYUSHO CHARACTER VARYING(500),                   -- 本社住所
    GYOUSHUCODE NUMERIC (2, 0),                            -- 業種コード
    TOROKUBI TIMESTAMP,                                    -- 登録日
    TOROKUSHAID CHARACTER(8),                              -- 登録者ID
    KOSHINBI TIMESTAMP,                                    -- 更新日
    KOSHINSYAID CHARACTER(8),                              -- 更新者ID
    PRIMARY KEY (KIGYOCODE),
    UNIQUE (KIGYOCODE, KIGYONAME)
);
