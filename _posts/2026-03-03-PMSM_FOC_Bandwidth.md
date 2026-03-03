---
title: "带宽基础笔记：PMSM FOC 视角"
date: 2026-03-03 15:00:00 +0800
categories: [Motor Control, Engineering]
tags: [PMSM]
math: true
---


# 带宽基础笔记：PMSM FOC 视角

## 1. 带宽是什么

带宽（Bandwidth）是频域指标，用于描述系统能有效响应输入变化的频率范围。

- 带宽大：响应更快、跟踪更敏捷
- 带宽小：响应更慢、只能较好跟随低频变化

因此，带宽可以看作系统“快慢”的频域表达。

------

## 2. -3 dB 定义与通用求法

对传递函数 $H(s)$，令 $s=j\omega$，得到频率响应 $H(j\omega)$，其幅值为：

$$
|H(j\omega)|
$$

若低频增益为 $|H(j0)|$，带宽 $\omega_B$ 通常定义为：

$$
|H(j\omega_B)|=\frac{|H(j0)|}{\sqrt{2}}
$$

若低频增益为 1，则简化为：

$$
|H(j\omega_B)|=\frac{1}{\sqrt{2}}
$$

这就是常说的 -3 dB 带宽。因为当幅值变为 $1/\sqrt{2}$ 时，功率变为原来的一半：

$$
\left(\frac{1}{\sqrt{2}}\right)^2=\frac{1}{2}
$$

### 通用步骤

1. 写出 $H(s)$
2. 令 $s=j\omega$ 得到 $H(j\omega)$
3. 求 $|H(j\omega)|$
4. 写出 -3 dB 条件
5. 解出 $\omega_B$（需要时换算 $f_B=\omega_B/(2\pi)$）

------

## 3. 一阶与二阶系统带宽

### 3.1 一阶系统

标准一阶系统：

$$
H(s)=\frac{1}{Ts+1}
$$

其幅值：

$$
|H(j\omega)|=\frac{1}{\sqrt{1+(\omega T)^2}}
$$

代入 -3 dB 条件可得：

$$
\omega_B=\frac{1}{T},\quad f_B=\frac{1}{2\pi T}
$$

结论：$T$ 越小，带宽越大，系统越快。

### 3.2 二阶系统

标准二阶系统：

$$
H(s)=\frac{\omega_n^2}{s^2+2\zeta\omega_n s+\omega_n^2}
$$

其幅值为：

$$
|H(j\omega)|=\frac{\omega_n^2}{\sqrt{(\omega_n^2-\omega^2)^2+(2\zeta\omega_n\omega)^2}}
$$

若低频增益为 1，-3 dB 带宽满足：

$$
\omega_B=\omega_n\sqrt{1-2\zeta^2+\sqrt{2-4\zeta^2+4\zeta^4}}
$$

常见工程区间 $\zeta=0.5\sim0.8$ 内，常近似采用：

$$
\omega_B\approx\omega_n
$$

但这是近似，不是严格相等。

------

## 4. 带宽、交叉频率与时域性能

开环增益交叉频率定义为：

$$
|L(j\omega_c)|=1
$$

闭环带宽定义为：

$$
|T(j\omega_B)|=\frac{1}{\sqrt{2}}
$$

在很多常规系统中，常有：

$$
\omega_B\approx\omega_c
$$

此外，带宽与时域速度通常负相关于上升时间：

$$
t_r\propto\frac{1}{\omega_B}
$$

带宽增大通常会提升响应和抗扰速度，但也可能降低稳定裕度、增大噪声敏感度。

------

## 5. PMSM FOC 中如何理解带宽

PMSM FOC 虽模块多（PI、坐标变换、SVPWM、逆变器、电机、采样等），本质仍是动态闭环系统，因此可以讨论带宽。

工程上不谈“一个总带宽”，而是分环讨论：

- 电流环带宽
- 速度环带宽
- （可选）位置环带宽

### 5.1 电流环

以 q 轴为例：输入 $i_q^*$，输出 $i_q$，闭环传递函数可写为：

$$
T_{iq}(s)=\frac{i_q(s)}{i_q^*(s)}
$$

带宽定义：

$$
|T_{iq}(j\omega_{Bi})|=\frac{|T_{iq}(j0)|}{\sqrt{2}}
$$

在 $dq$ 坐标下，忽略或补偿耦合后，每轴近似：

$$
u=Ri+L\frac{di}{dt},\quad G_i(s)=\frac{1}{Ls+R}
$$

因此电流环可近似按“一阶对象 + PI”分析。其物理意义是电流（进而转矩）建立快慢。

### 5.2 速度环

速度环输入输出为 $\omega^*\to\omega$，闭环可写为：

$$
T_\omega(s)=\frac{\omega(s)}{\omega^*(s)}
$$

带宽定义：

$$
|T_\omega(j\omega_{B\omega})|=\frac{|T_\omega(j0)|}{\sqrt{2}}
$$

当电流环足够快，近似 $i_q\approx i_q^*$，并有：

$$
T_e=K_t i_q,\quad J\frac{d\omega}{dt}=T_e-T_L-B\omega
$$

于是速度环对象近似：

$$
G_\omega(s)=\frac{\omega(s)}{i_q(s)}=\frac{K_t}{Js+B}
$$

其物理意义是转速跟踪和扰动恢复快慢。

### 5.3 串级带宽配置

FOC 为串级结构：

$$
\omega^*\rightarrow\text{速度 PI}\rightarrow i_q^*\rightarrow\text{电流 PI}\rightarrow u_q\rightarrow\text{电机}
$$

要保证外环设计成立，通常要求：

$$
\omega_{Bi}\gg\omega_{B\omega}
$$

常用经验：

$$
\omega_{Bi}=5\sim10\times\omega_{B\omega}
$$

即“内环快，外环慢”。

------

## 6. 带宽的价值与上限

带宽不仅决定跟踪速度，也决定抗扰能力。例如速度环中负载扰动 $T_L$ 出现时，带宽越大，恢复通常越快。

但带宽不能无限提高，常见限制包括：

1. 采样频率限制
2. PWM 与执行链路延时
3. 计算延时
4. 参数不确定性
5. 电压/电流饱和
6. 未建模动态（死区、量化、噪声等）

因此工程设计需要在“响应速度”和“稳定鲁棒性”之间折中。

------

## 7. 总结

- 带宽定义本质是 -3 dB 频率
- 一阶系统中 $\omega_B=1/T$
- 二阶系统中 $\omega_B$ 与 $\omega_n,\zeta$ 共同决定
- PMSM FOC 需分环设计带宽，而不是追求单一“总带宽”
- 串级系统遵循“电流环快、速度环慢”，常按 5 到 10 倍配置
- 带宽越大不一定越好，必须结合稳定性、噪声与硬件约束综合设计
