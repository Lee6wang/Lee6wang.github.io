# The Design Philosophy and Engineering Consequences of the STM32 Clock Architecture

> *From "it can run" to "system behavior can be proven"*

---

## Before We Start: Why Are Clock Problems Always Suspected Last?

In embedded systems, the clock is almost never the "first suspect".

When a system fails, we are more used to suspecting:

- The driver is wrong
- The interrupt priority is wrong
- DMA has a race condition
- RTOS scheduling is abnormal
- Compiler optimization is too aggressive

Clock configuration is usually revisited only at the end, and sometimes never revisited at all.

But real engineering experience says the opposite:

> Most "intermittent, low-probability, environment-dependent, hard-to-reproduce" system problems are essentially cases where a time assumption has been broken.

Their common features are:

- The system can run
- The function is normal most of the time
- The probability changes when temperature, load, supply, or board changes
- Logs or breakpoints cannot reproduce the issue reliably

And these are exactly the typical symptoms of clock-system instability or wrong clock cognition.

---

### Who Is This Article For?

This is not an introductory STM32 clock tutorial.

If you only want to know:

- How to configure RCC registers
- What a particular CubeMX option means

the official manual is already clear enough.

This article is for:

- Engineers who have already used STM32 in real projects
- Engineers who have met "mysterious" problems but could not explain the root cause
- Engineers who want to move from "I can configure clocks" to "I can design a clock strategy and prove system behavior"

---

### The Core Position of This Article: Please Accept These Three Points First

1. Clock is not equal to frequency.
2. Clock is a constraint on system behavior.
3. Whether a system is correct depends on whether its time assumptions can be proven.

As you continue reading, we will repeatedly return to these three points.

---

## Chapter 1: An Expert View of the STM32 Clock System

### It Is Not a "Clock Tree"; It Is a "System Behavior Contract"

In most materials, the STM32 clock system is drawn as a "clock tree":

- HSI / HSE
- PLL
- AHB / APB
- Peripheral clocks

This drawing is not wrong, but it can mislead you in engineering:

> You may understand the clock as a "configuration path" instead of a "system constraint".

### 1.1 From "Clock Tree" to "System Behavior Constraint Tree"

In a real system, the clock does not only decide "how fast it runs". It decides:

- The CPU instruction-fetch cadence
- Flash access timing
- Bus arbitration and DMA behavior
- Interrupt response latency and jitter
- The position of peripheral sampling points
- The trustworthiness of software time, such as delay, timeout, and tick

In other words:

> The clock system defines the time contract of the entire SoC.

Once this contract is broken in some corner, the system may not crash immediately, but its behavior is no longer predictable.

---

### 1.2 Why `SystemCoreClock` Is Only "Cognition", Not Fact

In the STM32 software ecosystem, there is a very misleading variable:

```c
uint32_t SystemCoreClock;
```

Many engineers subconsciously treat it as the current system frequency.

That is a dangerous illusion.

Because:

- It is a software variable
- It does not automatically reflect changes in RCC registers
- It depends on whether you update it at the correct time

> `SystemCoreClock` describes how many MHz you think the system is running at.

It does not describe how many MHz the system is actually running at.

Once the two become inconsistent, the consequences are chronic:

- Delay functions slowly become inaccurate
- Timeout mechanisms start to fail
- Watchdog feeding windows shift
- The RTOS timeline drifts silently

The most frightening part is:

> The system is still working, but every time-based logic path is being corroded.

---

### 1.3 Why STM32 Clock Design Must Be Understood at System Level

STM32 is never just a simple combination of "MCU plus peripherals".

Even in the earliest F1 series, it is already an SoC:

- Multiple clock domains
- Bus bridges
- DMA concurrency
- Mixed analog and digital blocks

The clock system is the thing that ties these modules together.

This means:

- Clock is not a local configuration
- Changing one prescaler is not merely "one peripheral becomes a bit slower"
- Changing the PLL is not merely "the main frequency changed"

Instead:

> The time relationships of the entire system have been redefined.

---

### 1.4 A Very Important Engineering Judgment Standard

In all later chapters, you can repeatedly use this rule to judge risk:

> If the correctness of a module depends on "what the current frequency is", and you cannot prove that frequency at runtime, then that module is not reliable from an engineering perspective.

---

### Chapter Summary

Before entering specific mechanisms, we first clarify three things:

1. The STM32 clock system is not a configuration table, but a system contract.
2. `SystemCoreClock` is software cognition, not hardware fact.
3. The real engineering problem comes from time assumptions being silently broken.

## Chapter 2: The Design Philosophy of the STM32 Clock Architecture

### These Awkward-Looking Designs Are Actually Engineering Choices

If you look at the STM32 clock system only from the perspective of "how to configure it", many parts look inelegant or even counterintuitive:

- Why does F1 have only one PLL?
- Why is APB1 frequency-limited while APB2 is not, or has a wider limit?
- Why does the timer clock "double" as soon as the APB prescaler is not 1?
- Why does the RCC startup process look so conservative?

The answers to these questions are not in "how to write the register". They are in this principle:

> The STM32 clock system is not designed to look elegant. It is designed to be controllable, manufacturable, and recoverable under real engineering conditions.

---

### 2.1 Why Does F1 Use "Single PLL Plus Multiple Dividers" Instead of Multiple PLLs?

From today's perspective, the F1 clock design looks simple, even modest:

- One PLL
- AHB / APB / ADC / USB dividers used to derive clocks afterward

But this is a very clear engineering tradeoff.

#### The Real Architectural Reason

In the process and cost era of F1, multiple PLLs meant:

- Multiple analog loops
- More complex layout isolation
- Higher power consumption
- Longer and harder-to-cover validation cycles

The goal of STM32F1 was not to provide the most flexible clock combinations. It was:

> To guarantee predictable and consistent system behavior under limited cost.

The benefits of single PLL plus dividers are:

- All derived clocks share the same source
- Frequency relationships among clock domains are stable
- Jitter, temperature drift, and abnormal behavior are concentrated in one place

From an engineering perspective, this is a very important property.

#### Engineering Consequences That Many People Do Not Notice

- One problem, system-level control

  If the PLL or source clock is unstable, the impact is system-level. It is not a hidden issue in only one peripheral.

- Cross-peripheral cooperative timing is more predictable

  DMA, timer-triggered ADC, and bus access do not face unknown phase relationships among different PLLs.

In other words:

> The F1 clock system sacrifices flexibility in exchange for system-level determinism.

---

### 2.2 Why Is APB1 Frequency-Limited While APB2 Is Not, or Has a Wider Limit?

This is one of the most easily misunderstood designs in the STM32 clock system.

Many people ask:

> Since both are peripheral buses, why treat them differently?

#### The Real Distinguishing Standard Is Not "Bus", but "Peripheral Type"

Peripherals mounted on APB1 have obvious common characteristics:

- I2C, CAN, USART2/3
- Lower-speed timers
- Stronger analog or timing-sensitive attributes

Peripherals on APB2 are usually:

- GPIO
- USART1
- SPI1
- Advanced timers

They are closer to the CPU and are more digital-logic-oriented peripherals.

In other words:

> APB1 is more likely to become the weak point of system stability.

If APB1 were also allowed to increase frequency without restriction:

- I2C filtering and sampling windows would become harsher
- CAN time quantization and resynchronization margin would be harder to configure
- EMI and interference sensitivity would increase sharply

#### The Real Engineering Purpose

The APB1 frequency limit is essentially doing one thing:

> Forcing you to reserve timing margin for fragile peripherals.

This is not a limit on capability. It is a limit on misuse.

---

### 2.3 Why Do Timers Double Their Clock When the APB Prescaler Is Not 1?

This is one of the most classic and most engineering-flavored rules in STM32 clock design.

On the surface, it looks very strange:

> The bus has been divided down, so why should the timer be doubled instead?

But from the design philosophy, this is a very smart compensation mechanism.

#### The Design Intent in One Sentence

> Do not let a power-saving or frequency-limiting strategy accidentally destroy control capability.

In engineering practice, common reasons for APB prescaling include:

- Reducing power consumption
- Reducing EMI
- Leaving margin for peripherals

But if lowering APB frequency directly caused:

- PWM resolution to fall
- Control periods to become coarse
- Capture precision to degrade

then engineers would be forced to:

- Either give up prescaling
- Or accept degraded performance

STM32 chooses a third path:

> When APB prescaler is not 1, double the TIM clock and decouple control capability from the peripheral-bus rhythm.

#### This Is a System-Level Compensation Design

It clearly expresses one design attitude:

> Energy saving should not come at the cost of control precision.

---

### 2.4 RCC: Safety First, Not Performance First

If you read the STM32 startup flow carefully, you will find that it is unusually conservative:

- Start from HSI by default
- External crystal requires explicit waiting for ready
- PLL switching steps are strict
- Clock security fallback is even supported through CSS

This is not because ST engineers were unwilling to be aggressive. It is because:

> RCC is essentially a system safety state machine.

#### The Primary Goal of RCC Is Not "Run Fast"

It is:

1. To boot under any condition
2. To fall back to a safe state when the clock is abnormal
3. To avoid leaving the system in an unrecoverable state

This is extremely important for mass-produced systems.

A system with a 0.1 percent startup-failure probability may look fine in the lab, but it is a disaster when shipped in tens of thousands of units.

#### Engineering Consequences

- STM32 is more suitable for unattended systems and complex field environments
- Startup may be a little slower, but it is controllable
- When problems occur, there is a fallback path

---

### 2.5 F1 / F4 / F7 / H7: The Essential Difference in Clock Design Complexity

If you compare STM32 product generations, you can see a clear trend:

> The higher the performance, the more the clock system looks like a real SoC.

#### F1: Single-Core, Single-Main-Domain Thinking

- One PLL
- A small number of derived domains
- Easy to understand and verify as a whole

#### F4 / F7: Performance-Driven Complexity

- More complex PLL structures
- Independent 48 MHz domains
- Flash acceleration mechanisms such as Prefetch and ART become key factors

#### H7: Multiple Power Domains Plus Multiple Clock Domains

- It must be treated as an SoC design
- Domains are related by contracts, not simple subordination
- Clock is no longer a main-frequency configuration; it is part of the system structure

#### A Very Important Engineering Understanding

> When migrating from F1 to H7, the most dangerous part is not that there are more registers. The most dangerous part is that you still look at clocks with a simple MCU mindset.

---

### Chapter Summary: How to Use Design Philosophy to Guide Engineering Decisions

By now, you should have realized:

1. STM32 clock design is never arbitrary piling up.
2. Behind every limit is a lesson from engineering accidents.
3. Understanding these design philosophies lets you:
   - Step into fewer traps
   - Predict risk earlier
   - Make more robust system choices

## Chapter 3: The Deep Mechanism of PLL

### It Is Not a "Multiplier"; It Is the Largest Analog Uncertainty Source in the System

If you allow only one module in an STM32 project to be treated as an analog system, it must be the PLL.

Many engineering accidents eventually point to one sentence:

> The average frequency is correct, but at certain instants the system is already off the correct timeline.

This sentence is almost always another way of describing a PLL problem.

---

### 3.1 PLL Input Path: Jitter and Stability Begin Here

In STM32, the PLL input usually comes from two paths:

- HSI / 2 -> PLL
- HSE -> PLL

This is not merely a flexibility design. It is an explicit exposure of engineering risk.

#### A Fact That Must Be Accepted First

> PLL cannot eliminate jitter. It can only redistribute jitter.

Its output jitter comes from the combination of two parts:

1. Phase noise or low-frequency jitter from the input source
2. Intrinsic noise of the PLL's internal VCO

Noise inside the loop bandwidth will be faithfully tracked.

Noise outside the bandwidth will be exposed or amplified.

#### Engineering Consequences, Not Theory

- If the input itself is unstable, the PLL only spreads that instability across the whole system.
- The output frequency may be statistically accurate, while instantaneous edge positions are drifting.

This is exactly the root of many phenomena:

- UART is normal most of the time, but occasionally reports framing error.
- Timer average period is accurate, but the control loop feels rough.
- USB enumeration fails under some supply or temperature conditions.

---

### 3.2 HSI/2 -> PLL: The Underestimated Engineering Cost

HSI has only one design goal:

> Ensure that the system can always start.

It is not designed for precision, and it is not designed for long-term stability.

#### The Reality Engineering Must Face

- HSI is an RC oscillator
- It has significant:
  - Frequency error
  - Temperature drift
  - Voltage dependence
- PLL does not correct these errors

When you use HSI/2 -> PLL, it means:

> You have chosen to amplify an imprecise time reference into the time contract of the entire system.

#### Why the Problem Is Often Intermittent

Because:

- RC drift is continuous
- Communication-system sampling windows are discrete

The system fails only when the two are just misaligned at a particular moment.

This is why:

- Running overnight in the lab may show no problem
- Changing temperature, supply, or board suddenly makes the problem appear

#### A Very Practical Engineering Judgment Standard

> If the system has any of the following requirements, HSI/PLL should be treated as a risky solution:
>
> - Precision UART or CAN
> - USB
> - Closed-loop control
> - Timestamping or metering
> - Wide-temperature environment

---

### 3.3 HSE -> PLL: Not "Everything Is Fine", but "Risk Transfer"

After realizing the problem with HSI, many engineers naturally move to the other extreme:

> Then I will just use an external crystal.

This is logically correct, but incomplete in engineering.

#### HSE Is Not an Ideal Clock Source

HSE is a system-level structure:

- The crystal itself
- Load capacitors
- PCB routing
- Oscillation circuit
- Power-supply noise

Any problem in these links will appear as:

- Startup time
- Jitter
- Low-temperature or aging behavior

#### A Very Dangerous Misunderstanding

> HSE ready does not mean HSE is already stable enough for engineering use.

Many systems fail at these moments:

- Switching SYSCLK immediately after power-on
- Initializing USB or PHY immediately after switching PLL
- Leaving no stabilization window during low-temperature startup

The behavior looks like:

- Very low-probability startup failure
- First communication attempt fails
- Power-cycling fixes it

#### Engineering Experience Conclusion

> HSE is a higher-accuracy solution, but it requires you to pay the engineering cost of the stabilization process.

---

### 3.4 PLL Lock Time: Why LOCK Does Not Mean Stable

The PLL LOCK flag is extremely misleading.

It means:

- The frequency has entered the lock window
- The phase error is within the allowed range

But it does not guarantee:

- Jitter is already minimal
- VCO amplitude is already stable
- Power-supply disturbance has already disappeared

#### The Most Common Engineering Trap

> Initializing peripherals immediately after SYSCLK switching.

Especially:

- USB
- SDIO
- High-speed UART
- Complex DMA peripherals

This error almost never reproduces 100 percent of the time. Once it appears, it is extremely hard to locate.

#### A Very Simple but Effective Engineering Strategy

> Always leave a stabilization window after clock switching.

Even if it is only:

- A few hundred microseconds
- A controlled software delay

it is often enough to turn intermittent abnormalities into predictable behavior.

---

### 3.5 Switching PLL / SYSCLK at Runtime: You Are Migrating System State, Not Changing a Frequency

STM32 allows you to switch clocks at runtime. This is not merely a configuration capability; it is a system-level feature.

But engineering must be clear on this point:

> You are not changing a parameter. You are migrating the entire system state.

At the instant SYSCLK switches, all of the following change:

- CPU instruction-fetch cadence
- Flash access timing
- Bus frequency
- SysTick reference
- Peripheral clock assumptions

#### A Mature Engineering Consensus

> If you cannot fully describe the system state before and after the switch, then you should not switch clocks at runtime.

#### Engineering-Level Safe Sequence, Simplified

1. Return to a safe clock source, usually HSI.
2. Adjust Flash Wait State in advance.
3. Configure the PLL.
4. Wait for stability, not only LOCK.
5. Switch SYSCLK.
6. Update `SystemCoreClock`.
7. Rebuild every module that depends on the clock.

This is not a best practice. It is the minimum survival condition.

---

### Chapter Summary: Why PLL Is an Accident-Prone Area

By now, you should be clear on these points:

1. PLL is the only analog module in STM32 that determines system time continuity.
2. The HSI/PLL problem is precision and jitter.
3. The HSE/PLL problem is startup and stabilization process.
4. LOCK only means entering the lock range. It does not mean "safe to use without concern".
5. Dynamically switching PLL is essentially migrating a system state machine.

If the first two chapters discussed design philosophy, this chapter has started touching the roots of engineering accidents.

## Chapter 4: Hidden Coupling Between Clocks and "System Correctness"

### A System That Runs Is Not Necessarily Correct

In engineering practice, one class of problem is especially frustrating:

- The system starts normally
- Functions are mostly usable
- Most tests pass
- But after long operation, environmental change, or load change, behavior becomes unreliable

These problems are often called:

- Mysterious bugs
- Intermittent problems
- Hard-to-reproduce problems

But if you stay calm enough, you will find that they share one feature:

> The system does not crash immediately. It silently deviates from correct time behavior.

And this deviation is almost always related to hidden coupling in the clock system.

---

### 4.1 Flash Wait State: Not "Whether It Runs", but "Whether It Runs Stably"

Many engineers understand Flash Wait State, or WS, as:

> If WS is insufficient, it will not run. Add enough and it is fine.

This is a dangerous simplification.

#### The Real Role of Flash WS

Flash WS essentially solves one problem:

> Whether the CPU instruction-fetch speed exceeds the Flash's ability to respond stably.

When you raise the system frequency to a critical point:

- Flash may still provide data
- But it no longer guarantees every access is inside the timing margin

What does this cause?

- Not necessarily HardFault
- Instead:
  - Occasional wrong instruction fetch
  - Interrupt latency jitter
  - Crashes only in extreme cases

#### The Most Dangerous State in Engineering

> A WS configuration that just barely runs.

In this state:

- It may be completely normal at room temperature
- When temperature rises or voltage falls, the margin is consumed
- Problems start appearing probabilistically

This is exactly why many systems become unstable in field environments.

#### Engineering Judgment Standard

> Flash WS should never sit on the extreme boundary. It is better to add one extra WS level in exchange for determinism.

---

### 4.2 Flash Prefetch: Average Performance vs Determinism

The design goal of Flash Prefetch is very clear:

> Improve average instruction throughput.

But its cost is often ignored.

#### The Engineering Essence of Prefetch

- It is a prediction mechanism
- Prediction hit means performance improves
- Prediction miss means pipeline flush

What does this mean?

> The time consistency of instruction execution is broken.

In most non-real-time systems, this is completely acceptable.

But in the following systems, it can become a hidden risk:

- High-frequency interrupts
- Control loops
- Precise timing triggers

#### Real Phenomena You Will See

- The average ISR latency is fine
- But the maximum latency is clearly stretched
- The control system feels rough, although the algorithm has not changed

This type of problem is extremely hard to locate with logs or breakpoints.

#### Engineering Strategy

> When the system is sensitive to worst-case timing, Prefetch must be evaluated as a risk factor.

In some control systems, it may even be better to:

- Lower frequency
- Add more Flash WS
- Disable Prefetch

in exchange for deterministic execution time.

---

### 4.3 Inconsistent `SystemCoreClock`: A Breeding Ground for Chronic Bugs

`SystemCoreClock` is the most easily misused variable in the STM32 software system.

#### A Fact That Must Be Repeated

> `SystemCoreClock` is only software cognition of the clock. It is not hardware fact.

It does not automatically synchronize RCC changes.

Once any of the following happens:

- Dynamic clock switching
- Bootloader -> App
- Low-power recovery
- Direct RCC modification through bare registers

and you forget or incorrectly update `SystemCoreClock`, the system enters an extremely dangerous state:

> Functions still work, but all time-related logic is slowly distorted.

#### Typical Chronic Symptoms

- `HAL_Delay()` becomes less and less trustworthy
- Timeout mechanisms trigger too early or too late
- Watchdog feeding cadence shifts
- The RTOS tick disconnects from real time

The most frightening part is:

> The system will not immediately tell you, "I am wrong."

---

### 4.4 SysTick Clock Source: The Foundation of Software Time

In most STM32 projects, SysTick is the time reference for:

- Delay functions
- RTOS scheduling
- Software timers

#### Why SysTick Is So Critical

Because:

> All software time ultimately depends on it.

The SysTick clock source is usually:

- HCLK
- Or HCLK / 8

Once the system experiences:

- Dynamic frequency change
- Low-power recovery

and SysTick is not synchronously rebuilt, what you get is not merely time error. It is:

> The collapse of the entire software time system.

#### Engineering Experience Conclusion

> SysTick must be treated as a system-level resource, not as a timer you casually use.

---

### 4.5 How Clock Error Is Amplified into Communication Abnormalities

Communication systems do not care about average frequency. They care about:

- Whether the sampling point is stable
- Whether phase drift exceeds tolerance

#### An Underestimated Fact

> Multiple small errors can add up into a fatal error.

Error sources include:

- Clock-source error
- PLL jitter
- Divider quantization error
- Remote-device error

Viewed separately, each one may be within specification.

Added together, they may cross the boundary.

#### Engineering Phenomena You Will See

- UART occasionally reports framing error
- CAN error frames increase
- USB enumeration becomes unstable

These problems are often misdiagnosed as:

- Driver problems
- Cable problems
- Remote-device problems

---

### Chapter Summary: Why "The System Has Started" Does Not Mean "The System Is Correct"

This chapter can be summarized in three sentences:

1. Flash timing problems often appear as real-time behavior problems, not startup problems.
2. Prefetch improves average performance, but may damage determinism.
3. Wrong time cognition, such as `SystemCoreClock` or SysTick errors, creates chronic system corrosion.

If the previous chapter explained the starting point of accidents, namely the PLL, this chapter explains:

> Why accidents can stay hidden for so long before they erupt.

## Chapter 5: Engineering-Level Strategies for APB / AHB Prescalers

### Prescaling Is Not "Degradation"; It Is a System Tuning Knob

In many STM32 projects, the decision process for prescalers is often:

> Push the main frequency to the maximum, then divide APB1 down according to the manual, and for the rest, as long as it runs, it is fine.

This is a function-oriented approach, not a system-oriented approach.

Mature engineering treats AHB / APB prescalers as:

> Key knobs for shaping system rhythm, stability, and robustness.

---

### 5.1 Why "72 MHz Can Run" Does Not Mean "It Should Run at 72 MHz"

That STM32, taking F1 as an example, can run at 72 MHz means one thing:

> Under ideal conditions, the chip can still satisfy functional correctness at this frequency point.

But engineering systems never face only ideal conditions.

#### Systemic Costs of 72 MHz

When HCLK is pushed to the upper limit, the following things almost inevitably happen:

- Flash access approaches the timing boundary
- AHB bus switching frequency increases, and EMI rises sharply
- Transient current peaks in the power supply become larger
- DMA / CPU / peripheral contention intensifies

These problems may not be obvious in the lab, but they will be gradually amplified in real environments.

#### An Important Engineering Judgment Standard

> If system compute utilization is below 50 percent for a long time, then running at the top main frequency is almost certainly spending stability margin unnecessarily.

Many mature mass-produced systems choose:

- HCLK = 48 MHz
- HCLK = 36 MHz

The cost is a performance reduction that is almost imperceptible.

The benefits are:

- EMI improves significantly
- Power consumption drops
- Temperature margin increases
- System behavior becomes more predictable

---

### 5.2 AHB Prescaler: An Underestimated System Decoupler

AHB is the most critical shared resource inside STM32:

- CPU instruction fetch
- SRAM / Flash access
- DMA bursts
- Peripheral register access

When HCLK is high, these behaviors overlap heavily in time.

#### The Real Value of AHB Prescaling

AHB prescaling is not only "lower frequency to save power". It does something more important:

> It reduces the probability of worst-case synchronous superposition in the system.

That is:

- CPU no longer competes with DMA and peripherals on the same beat as aggressively
- Peak load is spread out in time
- Power and EMI pressure become controllable

#### A Typical Engineering Strategy

```text
SYSCLK = 72 MHz
HCLK   = 36 MHz
APB2   = 36 MHz
APB1   = 18 MHz
```

In many systems, this configuration behaves as:

- CPU is still fast
- Peripherals are clearly more stable
- Interrupt jitter decreases
- EMI and power improve significantly

---

### 5.3 The Real Impact on Peripheral Types When APB1 Is 36 MHz

APB1 is the bus domain that most needs engineering treatment.

#### 5.3.1 Timers (TIM)

When APB1 prescaler is not 1:

> TIM clock = 2 x PCLK1

The engineering meaning of this rule is:

- You can reduce bus frequency
- While keeping timer resolution unchanged

This is a very intentional compensation design.

##### Engineering Risk Point

If you forget this rule:

- PWM frequency will be calculated with a factor-of-two error
- The control period will shift as a whole
- All TIM-based time calculations will be logically correct but numerically wrong

#### 5.3.2 USART on the APB1 Domain

USART baud rate is derived from PCLK1.

When PCLK1 changes:

- Divider quantization error also changes
- Some baud rates may become more accurate or worse

##### Engineering Recommendation

> Do not choose frequency by feeling. Explicitly calculate baud-rate error.

In some systems, lowering PCLK1 can instead:

- Make the divider result friendlier
- Improve communication stability

#### 5.3.3 I2C

I2C is extremely sensitive to APB1:

- SCL high and low time
- Digital filtering behavior
- Coupling between rising edges and bus capacitance

Common engineering observations are:

- High PCLK1: OK in the lab, fails in the field
- Lower PCLK1: stability improves significantly

The reason is not the I2C protocol itself. It is that timing margin has been spread out again.

#### 5.3.4 CAN

CAN is a strict time-quantization system:

- Time quantum, TQ, is derived from PCLK1
- Resynchronization capability depends on time resolution

The consequence of too-high PCLK1 is:

- Jitter is amplified
- EMI becomes harder to control

What engineering really seeks is not:

> The higher PCLK1, the better.

It is:

> The combined optimum of sampling point, resynchronization margin, and interference environment.

---

### 5.4 Using Prescalers to Intentionally Shape Timer Resolution

This is an advanced but very practical engineering technique.

#### The Engineering Goal Is Not "The Faster the Better"

It is:

- Whether the time scale is easy to calculate
- Whether the control period is neat
- Whether modules synchronize cleanly

#### Engineering Method

- Keep SYSCLK unchanged
- Adjust APB prescaler to change TIMCLK
- Then combine it with PSC / ARR

You can obtain:

- More suitable PWM resolution
- More stable control period
- Lower quantization error

#### Typical Application Scenarios

- Motor control
- Precision frequency measurement or capture
- Using TIM instead of SysTick as the OS tick

---

### Chapter Summary: Prescalers Are Design Tools, Not Passive Limits

This chapter can be summarized as the following engineering understanding:

1. Main frequency is a capability limit, not a design target.
2. AHB prescaling is a system decoupler.
3. APB1 prescaling directly determines peripheral stability.
4. Timer clock doubling is intentional engineering compensation.
5. Prescaling can be used to shape time, not merely endure time.

If the previous chapters explained why problems happen, this chapter starts to tell you:

> How to actively design a system that is less likely to fail.

## Chapter 6: The Clock System from the Peripheral Perspective

### Peripherals Do Not Consume Frequency; They Consume Time-Error Budget

In many STM32 projects, the usual path for locating peripheral problems is:

> Peripheral is unstable
> -> suspect driver
> -> suspect hardware
> -> suspect cable or remote device
> -> finally, if there is still energy, look at the clock

From a system perspective, this order is completely reversed.

> Most peripherals do not care how many MHz you are running. They care whether the error has been used up inside their time window.

---

### 6.1 USART: Baud Rate Is Not the Target; the Sampling Window Is

USART is one of the easiest peripherals to use correctly and also one of the easiest to use incorrectly.

#### A Necessary Shift in Thinking

> USART does not care whether you are exactly 115200. It cares whether the sampling point still lands near the center of the bit.

Sampling-point drift comes from the superposition of multiple error sources:

- Clock-source error, HSI / HSE
- PLL jitter
- PCLK divider quantization error
- USART divider quantization error
- Remote-device error

Viewed individually, each item may be within specification.

Added together, they may exceed the boundary.

#### Why the Problem Is Often Intermittent

Because:

- Baud-rate error changes continuously
- USART sampling is a discrete event

When the error happens to push the sampling point out of the safe window at a particular instant, what you see is:

- Framing error
- Occasional lost bytes
- Abnormal first byte

#### A Very Practical Engineering Judgment Standard

> In asynchronous UART communication, total error on both sides should be within about 2 percent to be considered engineering-safe.

If you use:

- HSI/PLL
- High temperature or wide voltage
- High baud rate

this tolerance must be tightened further.

---

### 6.2 ADC: ADCCLK Limits Are Not "Manual Rules"; They Are Analog Reality

ADC is one of the most easily misused modules in STM32.

Many engineers ask:

> Since the ADC can run this fast, why does the manual not let me run it at the upper limit?

The answer is not in digital logic. It is in analog physics.

#### The Real Problem Behind ADCCLK

ADC conversion depends on:

- Charging the sample-and-hold capacitor
- Conducting through analog switches
- Internal comparison and quantization

When ADCCLK is too high:

- The sampling capacitor cannot fully charge in time
- Non-ideal switch effects are amplified
- Digital switching noise couples more easily into the analog domain

The result is:

- The average value appears correct
- The noise floor rises significantly
- Channels contaminate each other

This type of problem is extremely hard to find through functional tests.

#### Engineering Experience Conclusion

> ADCCLK should never run right against its upper limit. Leaving 20 to 30 percent timing margin often buys orders-of-magnitude better stability.

---

### 6.3 USB: The Rigid 48 MHz Constraint and How It Shapes System Design Backwards

USB is one of the most demanding STM32 peripherals.

There is only one reason:

> USB is a synchronous bus with almost no timing tolerance.

#### A Key Engineering Fact

> Once USB exists in the system, the clock-design authority is basically no longer in the CPU's hands.

USB requires:

- 48 MHz
- Very small error
- Low jitter

This means:

- PLL configuration must satisfy USB first
- SYSCLK / APB prescalers must make room for USB
- HSI/PLL is a high-risk solution in most USB scenarios

#### Typical Failure Mode

- SYSCLK / HCLK looks completely correct
- USB can enumerate most of the time
- Failure probability changes when PC / hub / cable changes
- Replugging restores it

This is almost certainly not a USB driver problem. It is:

> At certain instants, 48 MHz is already outside the USB safe window.

#### Engineering-Level Conclusion

> USB clock design must work backward from USB to the entire clock tree.

Not the other way around.

---

### 6.4 RTC: Time Is Not "As Long as It Ticks"; It Is "Will It Still Be Accurate Years Later?"

RTC is a peripheral with an extremely long time span, which makes its clock selection especially important.

#### Real Differences Between Clock Sources

- LSE, 32.768 kHz
  - High accuracy
  - Low temperature drift
  - Long-term stability
- LSI
  - Very low accuracy
  - Significant temperature drift
  - Suitable only as a fallback
- HSE / 128
  - Medium accuracy
  - Higher power consumption
  - Suitable as a compromise when there is no LSE

#### Common Wrong Assumptions in Engineering

> As long as RTC can count, it is fine. A little offset does not matter.

This assumption may hold for a few days.

After several months, it can become a disaster.

#### Engineering Experience Conclusion

> RTC is a long-term engineering decision, not a startup-time configuration item.

---

### Chapter Summary: Peripheral Problems Are Often Time-Budget Problems

This chapter can be summarized by one unified view:

- USART looks at the sampling window
- ADC looks at analog settling time
- USB looks at synchronous jitter
- RTC looks at long-term drift

Their common requirement is:

> On their own time scales, error must be controlled within budget.

And this budget is almost entirely determined by the clock system.

## Chapter 7: Dynamic / Non-Standard Clock Operations

### You Think You Are "Changing Frequency"; You Are Actually Migrating a System State Machine

In many STM32 projects, engineers will eventually have this thought:

> The system is already running, so can I change the clock while it is running?

The thought itself is not wrong.

STM32 does allow you to switch SYSCLK, reconfigure PLL, enter low power, and recover at runtime.

The real question is:

> Do you realize that this is not a configuration modification, but a system-state migration?

---

### 7.1 Switching SYSCLK at Runtime: State Migration, Not Parameter Adjustment

At the register level, switching SYSCLK looks like changing only a few bits:

- `CFGR.SW`
- `CR.PLLON`

But at the system level, what happens at that moment?

#### The Moment SYSCLK Switches, Many Things Change at Once

- CPU instruction cadence
- Flash access timing
- AHB / APB bus frequency
- SysTick timing reference
- Peripheral prescaler assumptions

That is:

> You are changing the entire system's cognition of time.

If you do not design clear boundaries for this cognition change, the system enters a half-correct state.

---

### 7.2 The Most Common and Most Fatal Misuse Scenario

> The system is already running stably, so I switch to a higher frequency at some moment and continue running.

The problem with this approach is:

- Peripherals are already initialized
- Timers are already counting
- The RTOS is already scheduling
- DMA is already transferring data

Yet you silently change the time base they all depend on, without notifying any module.

The result is often not an immediate crash. It is:

- Delays gradually become inaccurate
- Interrupt jitter increases
- Communication occasionally becomes abnormal

This is exactly the typical source of chronic bugs.

---

### 7.3 A Minimum Safe Switching Sequence

If you must switch SYSCLK at runtime, the following flow is not a best practice. It is:

> The minimum survival condition.

#### Engineering-Level Steps for Safe Switching

1. Return to a safe clock source.
   - Usually HSI.
   - Ensure the system is still running on a stable clock.

2. Adjust Flash Wait State in advance.
   - Configure it according to the target maximum frequency.
   - Do not wait until after the switch.

3. Reconfigure PLL.
   - Write parameters in one planned step.
   - Do not experiment while running.

4. Wait for stability.
   - Not only LOCK.
   - Leave a stabilization window.

5. Switch SYSCLK.
   - Make the switching moment explicit.
   - Do not switch in a high-load region.

6. Update `SystemCoreClock`.
   - This is the key step for cognition synchronization.

7. Rebuild every module that depends on clocks.
   - SysTick
   - Timers
   - Communication baud rates
   - Timeout mechanisms

If you find this flow too troublesome, it often means one thing:

> Your system is not suitable for runtime clock switching.

---

### 7.4 Before and After Low-Power Modes: The Most Underestimated Risk Zone

Low-power modes such as STOP and STANDBY look like "sleeping and waking up".

At the hardware level, they are more like:

> A mixed state of partial reboot plus state residue.

#### The Real Situation After Low-Power Recovery

- PLL is often turned off
- HSE may stop
- Flash / bus state may be reset
- But software variables still exist

This creates an extremely dangerous mismatch:

> Hardware has already started over, while software thinks everything is still as before.

#### The Most Common Engineering Mistake

- Assuming registers are still usable because they did not disappear
- Assuming `SystemCoreClock` is still the old value
- Assuming peripherals do not need to be reinitialized

After low-power recovery, these assumptions are almost all invalid.

#### A Reliable Engineering Principle

> Low-power recovery must be treated as a special restart.

Even if this means writing more initialization code.

---

### 7.5 MCO: A Severely Underestimated System-Level Debug Interface

In the STM32 pin list, MCO is often one of the first pins to be sacrificed.

From an engineering perspective, this is a very unfortunate choice.

#### The True Value of MCO

MCO can do two things that software can never do:

1. Turn clock cognition into a measurable physical signal.
2. Expose the clock-switching process under an oscilloscope.

This means:

- You can see the real frequency
- You can see switching transients
- You can distinguish among:
  - Configuration problems
  - Hardware problems
  - Environmental problems

#### A Sign of Mature Engineering

> Keep at least one test point that can output MCO.

Even if it is only used during debugging.

---

### 7.6 Bootloader / App Multi-Stage Clock Strategy: Ownership Must Be Clear

In systems with a bootloader, clock problems are almost inevitable unless the strategy is designed in advance.

#### A Core Problem

> Who exactly owns clock configuration?

There are three common modes:

1. Bootloader configures it, App inherits it.
   - Risk: App assumptions may be wrong.
2. Bootloader stays minimal, App takes full control.
   - Most recommended.
3. Bootloader and App each reconfigure it.
   - Strict boundaries are required.

#### Engineering-Level Recommended Strategy

- Bootloader:
  - Use only HSI.
  - Do not enable PLL.
  - Keep assumptions minimal.
- App:
  - Rebuild the full clock tree.
  - Do not depend on historical state.

This may look like repeated work, but what it buys is:

> Deterministic system behavior.

---

### Chapter Summary: Why This Chapter Is Accident-Prone

All dynamic or non-standard clock problems eventually point to one sentence:

> The system was forced to accept a new time contract without being informed.

The core engineering conclusions of this chapter are:

1. Runtime SYSCLK switching is state migration, not parameter modification.
2. Low-power recovery must be treated as a special restart.
3. MCO is a system-level debugging tool, not something optional.
4. Bootloader / App must define clock ownership clearly.

If the previous chapters discussed how to design a robust clock system, this chapter discusses:

> How to avoid pushing a stable system into instability by hand.

## Chapter 8: Analysis of Typical Advanced Problems

### When the System Starts Acting Like Mysticism, the Clock Is Almost Always Somewhere Behind It

If you review STM32 projects you have worked on, you will find that some problems have highly similar features:

- The occurrence probability is low
- They are hard to reproduce reliably
- Restarting often alleviates them
- Changing code, tuning priorities, or changing compiler does not help

These problems are usually categorized as difficult miscellaneous issues.

But from a system perspective, they are often different expressions of the same error pattern:

> Time assumptions have been broken, but the system has not had time to crash yet.

Below, we use four real, typical, and representative engineering problems to analyze the pattern.

---

### 8.1 UART Occasionally Loses Bytes: Eventually Found to Be Clock Jitter

#### Symptom Description

- UART baud rate is configured correctly
- Communication is completely normal most of the time
- Occasionally one byte is lost, or a framing error appears
- Restarting temporarily restores it

#### The Most Common Misdiagnosis Path

- Suspect DMA
- Suspect interrupt priority
- Suspect buffer overflow
- Suspect cable or remote device

The result is:

> The problem is constantly explained, but never truly solved.

#### The Real Root Cause

- The system uses HSI/2 -> PLL
- HSI low-frequency jitter and temperature drift are amplified by PLL
- The UART sampling point deviates from the bit center at certain instants
- This causes occasional sampling errors

The key is:

> The average baud rate is correct, but the instantaneous phase relationship is already wrong.

#### Engineering-Level Solution, Not a Single-Point Modification

1. Use HSE instead of HSI as the PLL input.
2. Lower SYSCLK or APB1 to reduce jitter propagation.
3. Adjust the baud rate to a friendlier divider point.
4. If necessary, lower the baud rate to gain margin.

#### How to Prove the Problem Is Solved

- High-temperature plus long-duration communication stress test
- Framing-error count stays at 0
- Oscilloscope shows TX edge jitter significantly reduced

---

### 8.2 Timer Period Drifts at High / Low Temperature

#### Symptom Description

- PWM / timer period is accurate at room temperature
- The period shifts noticeably when temperature changes
- The control system feels worse

#### Common Misdiagnosis

- Suspect timer configuration
- Suspect crystal quality
- Suspect compiler or optimization

#### The Real Root Cause

- The timer reference comes from SYSCLK
- SYSCLK comes from HSI/PLL
- RC oscillators have unavoidable temperature drift
- PLL cannot eliminate temperature drift; it inherits and amplifies it

#### Engineering-Level Solution

1. Move the critical time reference to HSE / LSE.
2. Use RTC or an external reference for period calibration.
3. Stop treating timer tick directly as physical time.

#### Self-Proof Method

- Measure the PWM period in a high/low-temperature chamber.
- Compare TIM drift against RTC or an external clock.

---

### 8.3 USB Enumeration Fails Although SYSCLK / PLL Looks Completely Correct

#### Symptom Description

- SYSCLK and HCLK measurements are normal
- USB can enumerate most of the time
- Failure probability changes when PC / hub / cable changes
- Replugging restores it

#### Common Misdiagnosis

- USB descriptor error
- USB driver bug
- Cable-quality issue

#### The Real Root Cause

- USB depends on a rigid 48 MHz clock domain
- 48 MHz comes from PLL division
- PLL jitter or switching transients pollute USB timing
- USB is initialized too early after switching SYSCLK

The essential problem is:

> At certain instants, 48 MHz is already outside the USB safe window.

#### Engineering-Level Solution

1. Work backward from USB to PLL and system-clock design.
2. Use HSE and avoid HSI/PLL.
3. Delay USB initialization after switching SYSCLK.
4. Avoid switching PLL at runtime.

#### Self-Proof Method

- Enumeration stress tests across multiple PCs and hubs
- Repeated tests under temperature and voltage disturbance
- MCO output of related clocks to verify stability

---

### 8.4 Hidden Errors Caused by Inconsistent Bootloader / App Clock Configuration

#### Symptom Description

- Bootloader upgrade function is normal
- App occasionally shows:
  - Inaccurate delay
  - Abnormal first UART packet
  - Watchdog reset

#### Common Misdiagnosis

- Suspect jump code
- Suspect interrupt vector table
- Suspect Flash layout

#### The Real Root Cause

- Bootloader configured PLL
- App assumes the system is still in default HSI
- `SystemCoreClock` does not match the real clock
- SysTick and peripheral parameters are all based on wrong cognition

This is an extremely classic, yet extremely hidden, problem.

#### Engineering-Level Solution, Strongly Recommended

- Bootloader:
  - Use only HSI.
  - Do not enable PLL.
- App:
  - Fully rebuild the clock tree.
  - Explicitly update `SystemCoreClock`.
- Clearly define clock ownership.

#### Self-Proof Method

- Test App independent startup.
- Test Bootloader-to-App jump.
- Confirm both paths behave exactly the same.

---

### Chapter Summary: The Common Pattern Behind These Incidents

The four problems look completely different, but they share the same structure:

1. Average behavior is correct.
2. Failure occurs under boundary conditions.
3. The failure is strongly related to temperature, load, or switching.
4. It is hard to explain at the software-logic level.

They share only one root cause:

> The system is still running, but it no longer obeys the original time contract.

## Chapter 9: Verification and Self-Proof Methods

### Turn "I Think It Is Fine" into "I Can Prove It Is Correct"

In real engineering, there is one harsh fact that must be accepted:

> As long as you cannot prove the current clock state at runtime, whether the system is correct is essentially based on luck.

Configuration is a one-time action.

Verification and self-proof are the safeguards across the entire lifecycle of the system.

This chapter does not discuss theory. It only discusses things you can do immediately on the board.

---

### 9.1 Derive the Real Clock Tree from RCC Registers Alone

This is the starting point of all self-proof.

Because:

- Registers are hardware facts
- HAL, CubeMX, and `SystemCoreClock` are only interpretations

> Every judgment must begin from RCC registers.

---

#### Engineering-Level Reverse-Derivation Sequence, Strongly Recommended as a Fixed Flow

**Step 1: Where does the current SYSCLK come from?**

Check `RCC->CFGR.SWS`:

- `00` -> HSI
- `01` -> HSE
- `10` -> PLL

This is the heartbeat source of the system.

---

**Step 2: If it comes from PLL, what are the PLL input and multiplier?**

Check:

- `PLLSRC`
- `PLLXTPRE`
- `PLLMUL`

Clarify three things:

1. Who is the input source?
2. Is it prescaled?
3. What is the real multiplication factor?

> Never trust "I remember I configured it."

---

**Step 3: Bus prescaler relationships**

Check:

- `HPRE`
- `PPRE1`
- `PPRE2`

Immediately form an engineering reflex:

> APB prescaler not equal to 1 -> TIM clock doubles.

---

**Step 4: Derived-domain checks, the easiest part to ignore**

- Whether USB satisfies 48 MHz
- Whether ADCCLK is in a safe range
- Which source RTC uses

---

#### An Extremely Important Engineering Judgment Standard

> If the value of `SystemCoreClock` is inconsistent with the result you derive from RCC registers, then system time is already untrustworthy.

There is no need to discuss how large the difference is.

As long as it is inconsistent, it is an error state.

---

### 9.2 Use MCO + Oscilloscope: Verify Real Frequency and Switching Transients

If register derivation is logical self-proof, MCO is physical self-proof.

This is a step that software methods can never replace.

---

#### Why MCO Has Irreplaceable Value

Because it can answer two key questions:

1. What exactly is the current frequency?
2. Are there any dirty instants during clock switching?

`printf` cannot do this. Logs cannot do this. Breakpoints cannot do this either.

---

#### Engineering-Level MCO Usage

**Recommended output objects:**

- SYSCLK
- PLLCLK
- HSE / HSI

**Recommended observation method:**

- Oscilloscope frequency measurement
- Enable persistence
- Observe the thickness of rising edges

---

#### Problems You Can Discover Directly with MCO

- PLL jitter is too large, so edges become rough
- There are abnormal cycles when switching SYSCLK
- Crystal quality differs between boards
- Frequency drift caused by temperature changes

> MCO is a board-level physical examination instrument.

---

### 9.3 Cross-Validate SysTick / TIM: Is Software Time Trustworthy?

SysTick is the software-time foundation in almost every STM32 project.

But it has one premise:

> `SystemCoreClock` is correct.

Therefore, SysTick must be cross-validated.

---

#### Engineering-Level Cross-Validation Method

**Method 1: Use TIM to output a reference frequency**

- Use TIM to output a 1 Hz or 1 kHz square wave.
- Measure it with an oscilloscope.

This is a hardware time reference.

---

**Method 2: Compare against SysTick**

- Use `HAL_Delay()` or RTOS delay.
- Count TIM cycles at the same time.

If the two are inconsistent:

> It is not TIM that is wrong. It is your software-time cognition that is wrong.

---

#### Real Problems You Usually Find

- SysTick was not reconfigured after dynamic frequency change
- `SystemCoreClock` was not updated
- Time drifts as a whole after low-power recovery

These problems are often not immediately fatal, but they will certainly corrode the system chronically.

---

### 9.4 Verify Main Frequency Without External Peripherals

This is the baseline capability of engineering self-proof:

> Even if all peripherals are off, you can still prove how many MHz the CPU is running at.

---

#### Method 1: GPIO Toggle Plus DWT, If Supported

- Use DWT `CYCCNT`.
- Count the cycles of a fixed instruction sequence.
- Derive the main frequency.

This is the most accurate method.

---

#### Method 2: Pure GPIO Toggle, Primitive but Effective

- Use a fixed loop.
- Toggle GPIO.
- Measure frequency with an oscilloscope.

It has only one advantage:

> It can quickly detect order-of-magnitude mistakes.

---

#### Method 3: TIM as the Only Peripheral

- Enable only one TIM.
- Use internal clock.
- Output a fixed period.

This is the most robust and most general engineering self-proof method.

---

### 9.5 Engineer the Self-Proof: Minimum Viable Verification Configuration

If this is:

- A mass-produced system
- A long-running system
- A field system that cannot be debugged easily

then you should consider verification capability during the design stage.

---

#### Strongly Recommended Minimum Set

1. One MCO output pad or test point
2. One TIM output test point
3. A piece of self-proof code that can be enabled at any time

For example:

- Print the current clock tree at power-on
- Output MCO in maintenance mode
- Allow field judgment of:
  - Configuration problem
  - Hardware drift
  - Environmental factor

---

### Chapter Summary: The Real Boundary of Engineering Maturity

By this chapter, you now have a capability that is rarely explained systematically:

- Not "I think the clock is correct"

- But:

  > I can prove it is correct in any state.

This is the real boundary of engineering maturity.

---

## Final Summary: The Five Most Important Engineering Conclusions About the STM32 Clock System

1. Clock is not equal to frequency. It is a system behavior contract.
2. PLL is an analog module and must be treated as an uncertainty source.
3. `SystemCoreClock` is cognition, not truth.
4. Dynamic clock change equals state-machine migration.
5. A system that cannot prove itself will eventually fail.
