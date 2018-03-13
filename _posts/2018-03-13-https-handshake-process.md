---
layout: post
title: "Https 握手过程"
description: "https/ssl handshake process"
subtitle: "https handshake process"
create-date: 2018-03-13
update-date: 2018-03-13
header-img: ""
author: "Mensu"
tags:
    - Frontend
---

> The article was initially posted on **{{ page.create-date | date: "%Y-%m-%d" }}**.

> 仅个人理解，有疏漏

# 安全传输数据

- 不可破解（对称/非对称加密）
- 完整一致（摘要一致）
- 来源可靠（证书合法）

# 证书

作用：证明服务端的公钥是服务端的。

- ``CA``：证书机构
- ``PKI``：公钥认证体系，包括 ``CA``、吊销列表 ``CRL``、注册机构 ``RA`` 等
- 数字签名：加密后的摘要（摘要算法是已知的。要防止内容和签名都被篡改）

CA 签发的证书包括 ``被证明者公钥``（如服务器、下级 CA）、``数字签名``（被 CA 私钥加密）和其他信息

客户端拿到证书，看到这个证书是某 CA 颁发的，就用 CA 的公钥解开数字签名得到摘要，再验证证书的完整一致性。是的话（加上没过期没被吊销）则证书合法。

CA 的公钥从哪里来？从证书得知某 CA，便可以请求它的证书，从证书里得到 CA 的公钥。一样，也要先验证 CA 证书的完整一致性。于是又要找上级签发机构的证书。一直找到根证书，由于内置在浏览器或操作系统，所以默认根证书的公钥是可靠的。然后就可以用根证书的公钥逐级往下验证。

# 过程

- TSL：客户端和服务器都需要证书 / SSL：只验证服务器的证书

- 客户端 -> 我会的加密方式版本、客户端随机数
- 钦定的加密方式版本、服务端随机数、服务端证书 <- 服务端
- 客户端验证证书，得服务端公钥
- 客户端生成预备主密钥、用 (客户端随机数、服务端随机数、预备主密钥) => 对称密钥
- 客户端 -> 服务端公钥(预备主密钥)
- 服务端解密得到预备主密钥、用 (客户端随机数、服务端随机数、预备主密钥) => 对称密钥
- 客户端 -> Change Cipher Spec 报文：开始加密啦
- 客户端 -> Finish 报文：对称密钥(至今报文的总摘要)，验证对称密钥对不对
- Change Cipher Spec 报文 <- 服务端
- Finish 报文 <- 服务端
- SSL 连接建立完成，开始用对称密钥加密通信