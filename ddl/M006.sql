-- ファイル種マスタテーブル定義
DROP TABLE IF EXISTS M006;
CREATE TABLE M006(
    FILECODE CHARACTER(8) NOT NULL,                       -- ファイルID
    FILENAME CHARACTER VARYING(20) NOT NULL,              -- ファイル名
    HYOUZIZYUN NUMERIC (2, 0) NOT NULL,                   -- 表示順
    SCREENID CHARACTER VARYING(2) NOT NULL,               -- 画面ID　1:アップロード 2:ダウンロード　
    TABLEID CHARACTER VARYING(30) NOT NULL,               -- テーブルID
    TOROKUBI TIMESTAMP,                                   -- 登録日
    TOROKUSHAID CHARACTER(8),                             -- 登録者ID
    KOSHINBI TIMESTAMP,                                   -- 更新日
    KOSHINSYAID CHARACTER(8),                             -- 更新者ID
    PRIMARY KEY (FILECODE)
);
