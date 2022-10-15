-- 参照制御マスタテーブル定義
DROP TABLE IF EXISTS M005;
CREATE TABLE M005(
    KIGYOCODE CHARACTER(13) NOT NULL,       -- 企業コード
    KENGENKIGYOCODE CHARACTER(13) NOT NULL, -- 権限保持企業コード
    SHORIKENGEN CHARACTER(2) NOT NULL,      -- 処理権限
    TOROKUBI TIMESTAMP,                     -- 登録日
    TOROKUSHAID CHARACTER(8),               -- 登録者ID
    KOSHINBI TIMESTAMP,                     -- 更新日
    KOSHINSYAID CHARACTER(8),               -- 更新者ID
    PRIMARY KEY (KIGYOCODE, KENGENKIGYOCODE)
);
