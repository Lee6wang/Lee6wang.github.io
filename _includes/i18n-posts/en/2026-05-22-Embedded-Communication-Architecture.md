# Communication Architecture Design for Complex Embedded Systems: Many Protocols Do Not Mean a Messy System

> Applicable scenarios: robots, mobile chassis, drones, industrial equipment, smart hardware, and automation control systems.  
> Core idea: the difficulty of communication architecture is not whether you can use UART, CAN, SPI, or I2C. The real difficulty is how to design information flow, module boundaries, priorities, and fault handling.

![Figure 1: Communication architecture overview for embedded systems](/assets/figure/2026-05-22/01_cover_comm_architecture.png)

When building embedded systems, the most exciting early moment is often "it finally runs."

The sensor can be read, the motor can spin, the host computer can send commands, and the serial port can print logs. At that moment, the system looks healthy, and the engineer looks healthy too.

But as more modules are added, communication problems gradually show their real shape:

Who exactly is using this serial port?  
Why did another node suddenly appear on this CAN bus?  
If I2C occasionally fails to read, is the wire too long, the interference too strong, or the device still asleep?  
Why does the control cycle start jittering when debug logs are enabled?  
If one module goes offline, why does the whole system seem to freeze?

At this point, you will find that the real trouble in a complex embedded system is not any single communication protocol. The real problem is **whether the system has a clear way to organize multiple communication methods at the same time**.

UART, I2C, SPI, CAN, RS485, USB, Ethernet, Wi-Fi, PWM, and ADC are not complicated when viewed alone. The complexity appears after they are placed into one system: who is responsible for control, who is responsible for feedback, who is responsible for configuration, who is responsible for safety, who may be slower, and who must respond immediately.

The essence of communication design is not "how to connect the wires", but "how to govern the system."

## 1. Why Do Complex Communication Systems Turn into a Mess?

In many systems, communication grows naturally during early development.

Need to read a temperature sensor? Add an I2C bus.  
Need to connect an IMU? Add an SPI bus.  
Need debugging? Add a UART.  
Need to control motors? Add a CAN bus.  
Need to connect to a host computer? Add USB.  
Need remote status monitoring? Add Wi-Fi.  
Need data upload? Add Ethernet.

Each step looks reasonable by itself. Put them together, and the result can easily become cyber spaghetti.

The problem is usually not that there are too many protocols. The problem is that the system has not answered these questions:

Who is the system-level controller?  
Who is the local controller?  
Which modules only execute commands?  
Which states must be reported upward?  
Which data should stay inside local closed loops?  
Are the control link and debug link mixed together?  
Are real-time data and non-real-time data mixed together?  
After a communication fault, should the system hold, brake, stop, or degrade operation?

If these questions are not defined in advance, the system changes from "many modules" to "messy relationships."

What complex systems fear most is not too many interfaces, but unclear boundaries.

## 2. Layer First, Then Choose Protocols

When many people design communication, their first reaction is:

Should this use CAN or RS485?  
Should the host computer and main controller use USB or Ethernet?  
Should the sensor use I2C or SPI?  
Should we use EtherCAT?

These questions are certainly important, but they are not the first question.

The first question should be: **how many layers does this system have, and what is each layer responsible for?**

![Figure 2: Layered communication model for a complex embedded system](/assets/figure/2026-05-22/02_layered_architecture_model.png)

A relatively general complex embedded system can be divided into five types of layers.

### 1. Application Layer

The application layer includes host software, apps, cloud platforms, ROS2 nodes, web consoles, debug tools, and similar components.

This layer is responsible for task goals, parameter configuration, status display, log reading, data recording, and algorithm output.

It cares about "what the system should do", not how to read a specific sensor register.

### 2. System Master Layer

The system master layer is responsible for global coordination.

It usually handles task dispatching, state machine management, safety decisions, module scheduling, fault aggregation, and communication protocol maintenance.

The master should not fall directly into every low-level device detail. A mature master should face "functional modules", not a pile of exposed sensors and actuators.

### 3. Module Control Layer

The module control layer is responsible for local autonomy.

Examples include a chassis controller, power management board, sensor acquisition board, motion control board, temperature control module, and valve control module.

The value of this layer is complexity encapsulation. A module can be complex internally, but it should expose clear and stable interfaces externally.

### 4. Device Layer

The device layer includes motors, drivers, encoders, IMUs, temperature sensors, relays, valves, heaters, displays, and similar hardware.

This layer is closer to hardware implementation. It focuses on registers, timing, sampling, PWM, ADC, GPIO, electrical characteristics, and low-level protection.

### 5. Safety Layer

The safety layer is not ordinary business communication. It is the system protection mechanism.

Emergency stop, enable signals, limit switches, watchdogs, power protection, over-current protection, and over-temperature protection should all be designed as part of the architecture.

A basic principle is: **the closer protection is to the hazard source, the more local it should be; the more critical a safety action is, the less it should fully depend on an ordinary communication link.**

## 3. A System Has at Least Five Kinds of "Speech", and They Should Not Be Mixed

Data in a complex system is not all the same kind of thing.

Some data is control commands, some is status feedback, some is configuration parameters, some is logs, and some is safety signals used to keep the system alive.

If all of them are squeezed onto the same link without priority and strategy, the communication system becomes like a group chat: work notices, meal orders, memes, and fire alarms all appear at the same time, and nobody knows what to read first.

![Figure 3: Five types of information flow in a communication system](/assets/figure/2026-05-22/03_five_information_flows.png)

### 1. Control Flow: Who Commands Whom

Control flow is the path through which the system sends commands downward.

For example, in a mobile robot, the host computer sends target linear velocity and angular velocity. The chassis controller performs kinematic calculation, then distributes velocity or current targets to motor drivers.

Control flow must define control authority clearly. Who does an actuator listen to? If an autonomous task, remote control input, and debug tool all send commands at the same time, who has priority? If emergency stop appears, can it override all ordinary control commands?

Control flow fears multiple commanders most.

### 2. Status Flow: What State the Device Is In

Status flow is the path through which devices report their current state upward.

It includes position, velocity, current, temperature, voltage, fault codes, online state, task completion progress, and so on.

More feedback is not always better. The lower layer can sample raw data at high frequency, but it does not have to blindly upload every raw value to the host computer.

A better approach is for the module layer to aggregate and abstract first, then report meaningful states upward.

For example, instead of only uploading ADC=2637, the module reports "battery voltage normal" or "power module low-voltage warning."

### 3. Configuration Flow: Parameters Must Not Be Changed Casually

Configuration flow is used to modify system parameters.

Examples include device ID, PID parameters, zero calibration, communication baud rate, control mode, and sensor calibration values.

Configuration data does not need to be high frequency, but it must be reliable. If a control command loses one frame, the next frame may overwrite it. But if a zero calibration value is written incorrectly once, the device may "reinterpret the world" from then on.

Therefore, configuration commands usually need confirmation mechanisms, and critical configuration also needs secondary confirmation.

### 4. Log Flow: Debugging Matters, but It Must Not Block the Road

Logs are the lifeline for engineers when debugging a system.

But logs must not affect the control link.

Many early systems like to print a large amount of debug information through the control serial port. At low frequency, this may be fine. Once the control cycle becomes faster, logs may occupy bandwidth, block transmission, and even introduce control jitter.

If enabling logs makes the system unstable, logs have changed from an "observer" into a "participant." That is very inelegant engineering.

### 5. Safety Flow: Life-Saving Signals Must Not Queue

Safety flow includes emergency stop, over-current, over-temperature, low voltage, limit switch trigger, communication timeout, master loss, driver abnormality, and so on.

Safety signals must have the highest priority.

Emergency stop must not wait in line.  
Over-temperature must not "remind later."  
Low voltage must not wait until logs finish sending.  
A triggered limit switch must not fairly compete with ordinary status packets.

In mature systems, key safety signals are either implemented by independent hardware or given the highest protocol priority and a clear fail-safe strategy.

## 4. Case 1: Why a Mobile Robot Host Should Not Directly Control Every Motor

A mobile robot chassis is one of the most typical communication architecture examples.

Assume a four-wheel chassis has four motor drivers, encoders, an IMU, a battery management module, and a host computer.

The most intuitive approach is: the host computer directly connects to all motor drivers, sends each wheel speed separately, reads each motor state, and calculates odometry by itself.

This can certainly run, but it creates several long-term problems:

The host interfaces become complicated.  
Motor synchronization becomes difficult.  
Control real-time behavior is affected by host load.  
Fault handling is scattered.  
Chassis logic and navigation logic become coupled.  
Replacing drivers or adding wheels later affects upper-layer software.

A more reasonable approach is to add a chassis controller.

![Figure 4: Communication architecture for a mobile robot chassis](/assets/figure/2026-05-22/04_mobile_robot_chassis_case.png)

The host computer only sends semantic targets, such as `cmd_vel`: linear velocity and angular velocity.

The chassis controller handles kinematic calculation, motor speed distribution, encoder reading, IMU fusion, odometry calculation, chassis safety protection, and fault aggregation.

Motor drivers only execute local closed loops and report velocity, current, temperature, and fault codes.

In this way, the host computer sees a "chassis module", not four scattered motors.

This is the value of modular communication architecture: **the upper layer faces functional semantics, while the lower layer handles device details.**

## 5. Case 2: Why Drones Separate Remote Control, Telemetry, Video, and Internal Flight-Control Buses

Drones are well suited for explaining why different communication links should not be mixed together.

A drone usually contains a remote-control link, telemetry link, video link, internal flight-control sensor bus, flight-controller-to-ESC control link, communication to the gimbal and camera, battery management communication, and more.

![Figure 5: Layering of drone communication links](/assets/figure/2026-05-22/05_drone_communication_links.png)

The remote-control link carries flight control input and requires low latency and high reliability.

The telemetry link carries status feedback, mission points, parameter configuration, and ground station commands.

The video link carries video frames. Its data volume is large, but it should not affect the flight-control closed loop.

The internal flight-control sensor bus carries data from the IMU, barometer, magnetometer, GPS, and similar sensors. These data directly affect attitude estimation.

The flight-controller-to-ESC link directly determines motor output, so it must be stable and reliable, and it must have a clear fail-safe behavior.

If video freezes, the drone should not lose control.  
If telemetry disconnects, the drone should not immediately fall.  
If remote control disconnects, the flight controller should enter fail-safe mode.  
If the IMU becomes abnormal, the system should identify it and protect or degrade operation.  
If the battery voltage is low, the system should warn or even return home.

The lesson from drones is: **control links, data links, video links, and safety links are not the same thing.**

## 6. Case 3: A Smart Coffee Machine Also Needs Communication Architecture

Do not think communication architecture belongs only to robots and industrial equipment.

A slightly advanced smart coffee machine may also contain a main MCU, water pump, heating module, temperature sensor, pressure sensor, flow meter, grinder motor, touch screen, Wi-Fi module, liquid-level detection, and safety protection circuits.

If the architecture is messy, a very everyday engineering accident can happen: the user taps latte, the Wi-Fi module is uploading logs, temperature data is delayed, the water pump responds late, the heater is still trying hard to heat, and the final result is a cup of "hot water with engineering flavor."

A smart coffee machine should also distinguish:

User interaction.  
Process state machine.  
Temperature closed loop.  
Water pump control.  
Sensor feedback.  
Remote configuration.  
Log statistics.  
Dry-burn and over-temperature protection.

Among these, dry-burn and over-temperature protection clearly have higher priority than "upload today's coffee cup count."

This shows a fact: any system that contains control, feedback, configuration, logs, and safety protection essentially needs communication architecture.

## 7. Protocol Design Must Handle Not Only "Normal Chat", but Also Arguments, Disconnections, and Fake Death

Many custom protocols only define normal sending and receiving: frame header, device ID, command word, data length, data area, checksum, and frame tail.

That is only the foundation.

In real engineering, the more problematic cases are abnormal ones: inconsistent power-on order, sudden node dropout, module reboot, packet loss, master sending too fast, protocol version mismatch, bus abnormality, power fluctuation, and log congestion.

![Figure 6: Protocol frame and node lifecycle](/assets/figure/2026-05-22/06_protocol_failure_state_machine.png)

A mature protocol should at least consider the following items.

### 1. Device Discovery

After system startup, the master should know which key nodes are online.

Each node should ideally report device type, device ID, hardware version, firmware version, protocol version, capability description, and health state.

This is equivalent to taking attendance at startup. If people are missing and work starts anyway, rework is very likely.

### 2. Protocol Version

As the system evolves, protocol fields keep increasing.

At first, a status packet may contain only velocity. Later, current is added. Later again, temperature, fault code, mode word, and timestamp are added.

Without protocol versioning, mixing old and new devices becomes painful.

The master needs to know which protocol version the current node supports, whether it is compatible with current functions, and whether incompatible nodes should run in degraded mode or be rejected at startup.

### 3. Sequence Numbers and Timestamps

Sequence numbers are used to detect packet loss, disorder, and duplicates.

Timestamps are used for multi-sensor synchronization, latency analysis, and fault tracing.

In a multi-node system, debugging status data without timestamps often feels like watching surveillance footage with no date.

### 4. ACK and Retry

Not every message needs an ACK.

Periodic control targets can be overwritten by the next frame. Losing one frame occasionally may not require retransmission.

But configuration, calibration, mode switching, and firmware upgrade commands must have confirmation mechanisms, and critical operations need secondary confirmation.

### 5. Heartbeat and Timeout

The system must define how long without a heartbeat counts as offline.

After a module goes offline, what state should it enter? Hold, release, brake, stop, degrade, or wait for recovery?

After communication recovers, should it automatically return to running? Is manual confirmation required?

These strategies should not be decided temporarily. They should be written into the protocol and state machine.

### 6. Error Codes

An error code should not be only one "ERROR."

It should at least distinguish communication timeout, over-current, over-temperature, low voltage, stall, encoder abnormality, sensor abnormality, parameter error, protocol version mismatch, and so on.

Good error codes are not meant to make the system look professional. They are meant to help engineers stay up less at night.

## 8. Where Should Common Communication Methods Be Placed?

Protocol selection should obey architecture, not the other way around.

I2C is suitable for low-speed on-board sensors, such as temperature sensors, EEPROMs, and power management chips. It uses few wires, but its anti-interference and distance capabilities are limited, so it is not suitable as the backbone of a complex system.

SPI is suitable for high-speed on-board peripherals, such as Flash, ADCs, displays, and high-speed sensors. It is fast, but chip select and routing can become complex, so it is usually better for local connections.

UART is simple and general. It is suitable for point-to-point communication, module access, and debugging. But ordinary UART lacks natural arbitration and multi-node management, so it is not suitable for unlimited expansion into a system backbone.

RS485 is suitable for medium- and low-speed multi-node communication in industrial environments. It has strong anti-interference capability and supports longer distance. But it needs clear master-slave polling, address management, and timeout mechanisms.

CAN is suitable for multi-node control networks. It has arbitration, error detection, and priority mechanisms, and it is commonly used in vehicles, robots, and internal control networks of industrial equipment. But its bandwidth is limited, so it is not suitable for images, large logs, or high-throughput data.

CAN-FD can increase payload and bandwidth while keeping the advantages of the CAN ecosystem. It is suitable for control networks with more data than traditional CAN can comfortably carry.

Ethernet is suitable for high-bandwidth data, host communication, logs, remote maintenance, and interconnection between multiple computing nodes. Ordinary Ethernet is not naturally hard real-time, so additional mechanisms are needed to guarantee real-time behavior.

EtherCAT is suitable for multi-axis synchronization and high-performance motion control. But its system complexity, cost, and debugging threshold are higher. Whether to use it depends on whether high synchronization and deterministic real-time behavior are truly required.

One-sentence summary: **do not ask which protocol is best. Ask what responsibility it carries in the system.**

## 9. Use This Checklist When Designing Communication Architecture

A truly mature communication architecture is usually not chosen by intuition in one meeting. It is derived item by item from boundaries, data types, real-time requirements, reliability, fault handling, safety protection, and maintainability.

![Figure 7: Checklist for complex communication architecture design](/assets/figure/2026-05-22/07_architecture_design_checklist.png)

During design, focus on these checks:

Are module boundaries clear?  
Has the system been divided into reasonable functional modules?  
Which modules need independent MCUs, and which are simple peripherals?  
Are there unnecessary horizontal connections between modules?

Are data types classified?  
Are control, status, configuration, log, and safety data separated?  
Do different data types have different priority and reliability strategies?

Is real-time behavior clearly defined?  
Which data must have low latency?  
Which data can be slower?  
Can logs block control?

Is reliability defined?  
Which commands need ACK?  
Which data can be periodically overwritten?  
Are there sequence numbers, timestamps, and checksums?

Is fault handling complete?  
What happens when a device goes offline?  
What happens when the master restarts?  
What happens when a submodule restarts?  
Is manual confirmation required after communication recovers?

Is safety protection independent?  
Is emergency stop independent or highest priority?  
Are over-current and over-temperature handled locally?  
Does the system enter a safe state after communication abnormality?

Is maintainability sufficient?  
Are there device IDs, firmware versions, and protocol versions?  
Can error codes locate problems?  
Does the protocol support evolution, compatibility, and degraded operation?

## 10. Common Misunderstandings

### Misunderstanding 1: Connect Everything to One Main Controller

This is fast early and painful later.

The main controller will handle device polling, protocol parsing, control algorithms, log output, safety decisions, and host communication at the same time. In the end, it becomes the only overworked worker in the whole system.

### Misunderstanding 2: Treat UART as a Universal Interface

UART is convenient, but it is not suitable for unlimited expansion.

Multiple serial devices quickly consume main-controller resources and make wiring, protocols, and debugging messy.

### Misunderstanding 3: Send All Data to the Host Computer

The host computer is not a trash can.

The upper layer should see module semantics, not every raw byte from the bottom layer.

### Misunderstanding 4: Do Not Separate Debug Interfaces from Control Interfaces

Logs are used to observe the system. They should not change system behavior.

If enabling logs slows the system down, the log link needs to be redesigned.

### Misunderstanding 5: Design Only the Normal Flow, Not the Abnormal Flow

The real world does not run only through the normal flow.

Wires loosen, power fluctuates, devices reboot, data is lost, firmware becomes incompatible, and engineers make mistakes.

The protocol must assume that the world is imperfect.

## 11. Conclusion: Do Not Eliminate Complexity. Manage Complexity.

In complex embedded systems, having multiple communication methods is normal.

UART, I2C, SPI, CAN, RS485, and Ethernet are not enemies. The real question is whether they are placed in the right positions.

A good communication architecture does not unify all protocols into one. That is neither realistic nor necessary.

A good communication architecture lets each protocol do its own job:

What should be fast is fast.  
What should be stable is stable.  
What should be real-time is real-time.  
What should be isolated is isolated.  
What should be abstracted is abstracted.  
What should be confirmed is confirmed.  
What should be protected locally is protected locally.

When the system is small, communication relies on feeling.  
When the system grows, communication relies on architecture.  
When the system grows further, communication relies on discipline.

When UART, CAN, SPI, I2C, and Ethernet sit at the same table, that is not scary.

What is truly scary is that nobody arranged the seating.
