# From Pulses to Angle: Principles and Implementation of Incremental Encoders

> In motor-control systems, rotor-state acquisition can roughly be divided into sensorless and sensored methods.  
> Sensorless schemes estimate rotor state through electrical quantities such as current and back EMF; sensored schemes rely on sensors to measure it directly.  
> Incremental encoders are the most common position-feedback devices in sensored schemes. They have simple structure, high resolution, and controllable cost.
>
> Recently I started doing some motor-related work. Following the idea that good tools are needed before doing good work, I wrote some notes about electrical-angle and speed measurement. Later I may also write about Hall sensors, resolvers, and related sensors.
>
> Thanks to the figures shared by many people online. I will not recreate every wheel here.

---

## 1. Why Are Encoders Needed?

Before discussing how incremental encoders work, first answer a more fundamental question:

> **Why does motor control need an encoder?**

---

### 1.1 The Essence of Motor Control: Let the Rotor Go Where It Should Go

Whether it is a servo system, robot joint, or CNC machine, the core task of motor control is:

> **Control rotor position, speed, or torque so it follows the desired trajectory.**

This means the controller must continuously answer two questions:

1. Where is the rotor **now**?
2. How fast is the rotor rotating **now**?

Without this information, control has no basis.

---

### 1.2 Limitations of Open-Loop Control

The simplest motor drive is open-loop control: apply a voltage or PWM duty cycle and expect the motor to rotate in a certain way.

But the problem is:

| Expectation | Actual possibility |
| ----------- | ------------------ |
| Constant speed | Load variation causes speed fluctuation |
| Rotate 90 degrees | Inertia causes overshoot or undershoot |
| Hold still | External disturbance causes position shift |

An open-loop system cannot sense these deviations and therefore cannot correct them.

> **Without feedback, there is no real control.**

---

### 1.3 Closed-Loop Control Requires Feedback

The basic structure of closed-loop control is:

```text
Reference -> Controller -> Actuator -> Plant
    ^                         |
    |                         v
    +-------- Sensor <--------+
```

The sensor measures the actual state of the controlled object and feeds the result back to the controller. The controller compares "desired" and "actual" values and calculates a correction command.

In motor control, this sensor is the **encoder**.

---

### 1.4 Role of the Encoder: Convert Mechanical Motion into Electrical Signals

The motor rotor rotates continuously in space. This is a **continuous mechanical quantity**. The controller is a digital system and can only process **discrete electrical signals**.

Therefore, the system needs a translator:

> **Encoder = device that converts mechanical angular displacement into electrical signals**

More precisely:

```text
Continuous mechanical rotation -> discrete, countable, direction-aware pulse sequence
```

---

### 1.5 Why Not Measure Angle Directly?

You may ask: why not use an angle sensor that directly outputs the angle?

The answer is: **such sensors do exist, but each has tradeoffs.**

| Type | Output | Characteristics |
| ---- | ------ | --------------- |
| Potentiometer | Analog voltage -> angle | Wear, low resolution, limited number of turns |
| Absolute encoder | Digital angle code | No homing required, but higher cost and more complex structure |
| Resolver | Analog sine/cosine signals | High-temperature and vibration resistance, but requires decoding circuit |
| **Incremental encoder** | Pulse sequence | Simple structure, low cost, high resolution, no turn-count limit |

Incremental encoders are widely used because they achieve a good balance among **cost, resolution, and reliability**.

---

### 1.6 The "Philosophy" of Incremental Encoders

The design idea of an incremental encoder can be summarized as:

> **It does not record "where you are"; it records "how much you moved".**

It does not store absolute position. Instead, every time a certain amount of angular displacement occurs, it outputs a pulse. The controller accumulates these pulses to calculate position.

This design brings several characteristics:

| Characteristic | Meaning |
| -------------- | ------- |
| Relative | Position information is lost after power-off |
| Unlimited turns | No mechanical limit; it can rotate indefinitely |
| High resolution | Line count can reach thousands or even tens of thousands of PPR |
| Low cost | Simple structure and easy manufacturing |

---

## 2. Working Principle of Incremental Encoders (ABZ)

![Encoder structure](../assets/figure/2026-01-26/1.png)

### 2.1 What Is the Input of an Encoder? Mechanical Angular Displacement

An incremental encoder is connected to the motor shaft. Its **only physical input** is:

> **Mechanical angular displacement of the shaft, \(\theta_m\)**

The encoder itself has no "angle memory" or "angle reference". It can only sense **whether the shaft has moved and the relative change of that movement**.

Therefore, the primary task of the encoder is not to "measure angle" directly, but to:

> **Convert continuous angular displacement into detectable periodic changes.**

---

### 2.2 How Is Continuous Angular Displacement Converted into Detectable Events? The Code Disk

To implement this, the encoder fixes a **code disk with evenly spaced transparent and opaque structures** on the shaft.

- When the shaft rotates, the code disk rotates synchronously.
- Every time one line period passes, the optical path changes once.

Thus continuous angular displacement is converted into **periodic light-passing / light-blocking events**.

At this point, the encoder completes the first abstraction:

> **\(\theta_m\) (continuous) -> periodic physical events**

The number of lines determines **how many events are generated per revolution**, namely PPR, pulses per revolution.

---

### 2.3 How Are Physical Events Converted into Electrical Signals? Photoelectric Conversion and Shaping

The code disk itself does not generate electrical signals, so the encoder also contains:

- Light-emitting device, usually LED
- Photoelectric receiver
- Amplifier and shaping circuit

The working chain is:

1. LED provides a stable light source.
2. The rotating code disk modulates light transmission.
3. The photoelectric receiver outputs an analog electrical signal.
4. The signal is amplified, compared, and shaped.
5. Digital level changes are output.

At this point, the system completes the second abstraction:

> **Periodic physical events -> digital pulse signals**

If the encoder stopped here, it would output only **one pulse channel**.

---

### 2.4 Why Is One Pulse Channel Not Enough? Direction Information Is Missing

Imagine there is only one pulse signal. Each pulse means "the shaft moved by a certain angular displacement", but it cannot determine the rotation direction.

In other words:

> A single-channel pulse can express only \(|\Delta\theta_m|\), not \(\Delta\theta_m\).

In motor control, **direction is necessary information**. Therefore, the encoder must introduce a new information dimension.

---

### 2.5 How Is Direction Information Introduced? Orthogonal A/B Signals

The encoder places **two groups of photoelectric receivers** on the same line circle:

- Their spatial positions are offset by **1/4 line period**.
- Therefore, their output signals are offset by **90 degrees of phase** in time.

This gives:

- **A phase:** periodic pulse signal
- **B phase:** same frequency, lagging or leading A by 90 degrees

Thus the third abstraction is completed:

> **Relative displacement + phase lead/lag relationship -> displacement direction**

Direction judgment comes from the physical phase lead/lag relationship:

- A leads B -> forward rotation
- B leads A -> reverse rotation

---

### 2.6 What Information Do A/B Phases Really Provide?

It must be emphasized:

- A/B phases **do not directly give angle**.
- They provide the **number of displacement events** and the **direction**.

Therefore, the essential information output by the encoder is:

> **A signed and quantized representation of \(\Delta\theta_m\)**

The angle itself is calculated by the control system through **counting and accumulation**.

---

### 2.7 Why Is the Z Phase Needed? Missing Periodic Reference Point

So far:

- A/B phases can accumulate displacement.
- But the system still does not know "which revolution it is now" or "which position of the revolution this count corresponds to".

This means:

> **The system lacks a mechanical-period reference point.**

To solve this, the encoder adds a **Z track with only one transparent window** on the code disk:

- It outputs one pulse for every mechanical revolution.

Therefore:

- **The Z phase provides an absolute reference for one mechanical revolution**, not resolution.

---

### 2.8 Logical Division of A/B/Z Signals

At this point, the roles of the three signals are clear:

| Signal | Function |
| ------ | -------- |
| **A/B phase** | Express relative displacement and direction |
| **Z phase** | Express the reference event "one full revolution has occurred" |

The encoder itself still **does not store angle**, but it provides:

> **All raw information needed to construct the angle**

---

### 2.9 From Encoder Signals to Control Quantities

Inside the controller:

1. A/B edges -> counter +1 or -1
2. Accumulated count -> relative mechanical angle
3. Count difference between adjacent sampling periods -> speed
4. Z phase -> count calibration / alignment reference

It is important to note:

> **Angle and speed are not "given" by the encoder; they are "computed" by the system.**

---

## 3. Implementation in a Real System

The first two chapters established the signal logic of incremental encoders. This chapter discusses:

> **In actual hardware and software, how are A/B/Z signals converted into usable angle and speed?**

---

### 3.1 Hardware Interface: How Do Signals Enter the Controller?

In 48 V motor applications, such as electric vehicles, robots, and drones, the encoder is usually connected directly to the MCU. The interface is mainly **TTL/CMOS level**.

**Common interface types**

| Type | Level | Typical scenario |
| ---- | ----- | ---------------- |
| TTL | 5 V | Traditional encoders; confirm whether MCU pins are 5 V tolerant |
| CMOS | 3.3 V | Direct connection to mainstream MCUs such as STM32 |
| Differential (RS-422) | Differential signal | Used when cable length is long, for example over 1 m, or motor-side interference is serious |

> In 48 V systems, PWM switching noise from the power stage is the main interference source. But because the cable is often short, such as less than 50 cm, single-ended TTL/CMOS interfaces are sufficient in many cases.

**Wiring points**

1. **Power supply:** Encoder supply is usually 5 V and can be taken from the control board. Pay attention to isolation or single-point grounding with the motor-drive power ground.
2. **Signal wires:** A/B/Z signal wires plus GND. Shielded multi-core cable is recommended.
3. **Filtering:** The MCU input can use a 100-ohm series resistor plus a 1 nF capacitor to ground to form a simple RC low-pass filter.

```text
Encoder side          Control-board side
  A --------[100R]---------+---- TIM_CH1
                           |
                         [1nF]
                           |
 GND ----------------------+---- GND
```

**When to use differential interface**

Upgrade to a differential interface such as RS-422 when:

- Encoder cable length is greater than 1 m.
- Encoder wiring is close to high-current bus bars or MOSFETs.
- The counter jumps frequently while the motor is stationary.

A differential receiver chip, such as AM26C32 or MAX485, converts the differential signal to single-ended TTL before sending it to the MCU.

**Practical pitfall reminders**

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Counts jump after power-on | Encoder is 5 V while MCU is 3.3 V; levels do not match | Add level conversion or choose a 3.3 V encoder |
| Pulses are lost at high speed | Signal edge becomes slow and edge recognition fails | Shorten cable, reduce filter capacitance, check grounding |
| Counts become abnormal when the motor rotates | PWM switching noise coupling | Shielded cable, single-point grounding, keep away from power wires |

---

### 3.2 Counting Modes: 1x / 2x / 4x Multiplication

The edges of A/B signals can be counted in different ways:

| Multiplication mode | Count trigger condition | Counts per line period |
| ------------------- | ----------------------- | ---------------------- |
| 1x | A rising edge only | 1 |
| 2x | A rising edge + falling edge | 2 |
| 4x | All edges of A/B phases | 4 |

For a 1000 PPR encoder:

- 1x mode -> 1000 counts per revolution
- 4x mode -> 4000 counts per revolution

> **Multiplication improves resolution, but it does not change the physical number of encoder lines.**

Note: the higher the multiplication factor, the higher the requirements on signal quality and processing speed.

---

### 3.3 Hardware Implementation: Timer Quadrature Decoder Mode

Modern MCUs such as STM32 usually provide a built-in **quadrature encoder interface** in advanced timers.

![Timer encoder mode](../assets/figure/2026-01-26/2.png)

Configuration example using STM32 HAL:

```c
TIM_Encoder_InitTypeDef encoder_config = {
    .EncoderMode  = TIM_ENCODERMODE_TI12,   // 4x multiplication
    .IC1Polarity  = TIM_ICPOLARITY_RISING,
    .IC1Selection = TIM_ICSELECTION_DIRECTTI,
    .IC1Filter    = 0x0F,                   // Input filter, suppress glitches
    .IC2Polarity  = TIM_ICPOLARITY_RISING,
    .IC2Selection = TIM_ICSELECTION_DIRECTTI,
    .IC2Filter    = 0x0F,
};

HAL_TIM_Encoder_Init(&htim3, &encoder_config);
HAL_TIM_Encoder_Start(&htim3, TIM_CHANNEL_ALL);
```

Advantages of hardware decoding:

- **Zero CPU overhead:** counting is completed by hardware.
- **No pulse loss:** even if the CPU is busy with other tasks.
- **Automatic direction judgment:** the counter increments or decrements automatically.

---

### 3.4 Counter Overflow Handling: Extending to Multiple Turns

The range of a 16-bit counter is 0 to 65535. For a configuration of 4000 counts/revolution:

> 65535 / 4000 is about 16 revolutions before overflow.

The solution is **software extension**:

```c
volatile int32_t  total_count = 0;
volatile uint16_t last_count  = 0;

// Call periodically, such as at 1 kHz
void update_position(void) {
    uint16_t current = __HAL_TIM_GET_COUNTER(&htim3);
    int16_t  delta   = (int16_t)(current - last_count);
    total_count += delta;
    last_count   = current;
}
```

Key points:

- The forced conversion to `int16_t` automatically handles wraparound from overflow and underflow.
- The call frequency must be high enough to ensure `|delta| < 32768`.

---

### 3.5 Using the Z Phase: Homing and Calibration

Typical uses of the Z-phase pulse:

1. **Power-on homing:** rotate the motor slowly and clear the counter after detecting Z.
2. **Accumulated error calibration:** every time Z is detected, verify whether the count is an integer multiple of `PPR x 4`.
3. **Absolute position recovery:** rebuild absolute angle together with stored turn count.

Z-phase detection is usually implemented with an **external interrupt**:

```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
    if (GPIO_Pin == Z_PHASE_PIN) {
        int32_t expected = rounds * PPR * 4;
        int32_t actual   = total_count;
        
        if (abs(actual - expected) > TOLERANCE) {
            // Record error or trigger alarm
        }
    }
}
```

---

### 3.6 From Count to Physical Quantities: Angle and Speed

**Mechanical angle** calculation:

```c
#define COUNTS_PER_REV  (1000 * 4)  // PPR=1000, 4x multiplication

float get_angle_rad(void) {
    return (float)total_count / COUNTS_PER_REV * 2.0f * M_PI;
}

float get_angle_deg(void) {
    return (float)total_count / COUNTS_PER_REV * 360.0f;
}
```

**Speed** calculation using difference method:

```c
int32_t prev_count = 0;
float   dt = 0.001f;  // 1 ms sampling period

float get_speed_rpm(void) {
    int32_t delta = total_count - prev_count;
    prev_count = total_count;
    
    // delta / COUNTS_PER_REV = revolutions
    // revolutions / dt = revolutions per second
    // x 60 = RPM
    return (float)delta / COUNTS_PER_REV / dt * 60.0f;
}
```

> **Tip:** At high speed, the difference method has high precision. At low speed, consider the **period measurement method**, which measures the time interval between adjacent pulses.

---

### 3.7 Signal Quality Problems and Countermeasures

Common problems in real systems:

| Problem | Symptom | Countermeasure |
| ------- | ------- | -------------- |
| Electromagnetic interference | Count jump or wrong direction judgment | Differential interface, shielded cable, input filtering |
| Signal glitches | Count jitter while stationary | Hardware filter (`IC1Filter`), software debounce |
| Loose wiring | Intermittent pulse loss | Check connectors, use robust aviation plugs if needed |
| Level mismatch | Edges cannot be recognized | Confirm level standard; add level conversion if necessary |

Diagnostic methods:

- Use an oscilloscope to check whether A/B waveforms are clean and orthogonal.
- Rotate slowly by hand and check whether the count is stable.
- Monitor Z-phase calibration error.

---

### 3.8 Software Architecture Suggestion

A typical encoder-processing module structure is:

![Software architecture](../assets/figure/2026-01-26/3.png)

Benefits of layering:

- When changing encoder model, only the driver layer needs to be modified.
- Application-layer code can be reused.
- Unit testing becomes easier.

---

### 3.9 Chapter Summary

Key points for real-system implementation:

1. **Interface selection:** choose the right electrical interface according to distance, interference, and speed.
2. **Hardware decoding:** prefer the quadrature mode of the MCU timer.
3. **Overflow handling:** extend count in software to support multi-turn accumulation.
4. **Z-phase usage:** use homing calibration to eliminate accumulated error.
5. **Signal quality:** filtering, shielding, and correct wiring are essential.

> **The encoder is only the entrance of information; the real angle exists in the software counter.**

---

## Final Note

The design of an incremental encoder is elegant: it uses the simplest physical principle, light passing and blocking, and the most basic signal form, pulses, to build a complete position-feedback system.

Once the essence of A/B/Z signals is understood, reading hardware manuals and writing driver code is no longer copying configuration blindly. It becomes understanding why the configuration works.
