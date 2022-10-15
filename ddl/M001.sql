-- ユーザマスタテーブル定義
DROP TABLE IF EXISTS M001;
CREATE TABLE M001(
    USERID CHARACTER(8) NOT NULL,            -- ユーザID
    LOGINPW CHARACTER(20) NOT NULL,          -- ログインPW
    USERNAME CHARACTER VARYING(30),          -- ユーザ名
    USERNAME_KANA CHARACTER VARYING(30),     -- ユーザ名（カナ）
    SHOZOKUKIGYOCODE CHARACTER(13) NOT NULL, -- 所属企業コード
    LOGINSTATUS CHARACTER VARYING (2),       -- ログイン済フラグ
    TOROKUBI TIMESTAMP,                      -- 登録日
    TOROKUSHAID CHARACTER(8),                -- 登録者ID
    KOSHINBI TIMESTAMP,                      -- 更新日
    KOSHINSYAID CHARACTER(8),                -- 更新者ID
    PRIMARY KEY (USERID),
    UNIQUE (USERID, LOGINPW)
);
