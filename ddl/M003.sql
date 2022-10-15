-- 商品マスタテーブル定義
DROP TABLE IF EXISTS M003;
CREATE TABLE M003(
    KIGYOCODE CHARACTER (13) NOT NULL,                              -- 企業コード
    SHOHINCODE CHARACTER VARYING (14),                              -- 商品コード
    SYOHINCODE_DOKUJI CHARACTER VARYING (20),                       -- 商品コード（独自）
    SYOHINCODE_DOKUJI_EDABAN CHARACTER VARYING (20) DEFAULT 0,      -- 商品コード（独自枝番）
    BRANDCODE CHARACTER VARYING (10) DEFAULT 0,                     -- ブランドコード
    BRANDNAME CHARACTER VARYING (80),                               -- ブランド名
    HINBAN CHARACTER VARYING (20) NOT NULL,                         -- 品番
    COLORNAME CHARACTER VARYING (20),                               -- カラー名
    COLORCODE CHARACTER (3) NOT NULL,                               -- カラーコード
    SIZENAME CHARACTER VARYING (20),                                -- サイズ名
    SIZECODE CHARACTER (3) NOT NULL,                                -- サイズコード
    NISUGATANAME CHARACTER VARYING (20),                            -- 荷姿名
    NISUGATACODE CHARACTER (3),                                     -- 荷姿コード
    PRICE numeric (19, 4),                                          -- 価格
    SANSHOUKAISHIBI DATE,                                           -- 参照開始日
    SANSHOUSHUURYOUBI DATE,                                         -- 参照終了日
    TOROKUBI TIMESTAMP,                                             -- 登録日
    TOROKUSHAID CHARACTER (8),                                      -- 登録者ID
    KOSHINBI TIMESTAMP,                                             -- 更新日
    KOSHINSYAID CHARACTER (8),                                      -- 更新者ID
    UNIQUE (KIGYOCODE, SHOHINCODE, SYOHINCODE_DOKUJI, SYOHINCODE_DOKUJI_EDABAN, HINBAN, COLORCODE, SIZECODE)
    -- ユニークキーの組み合わせて、レコードを特定する。
);