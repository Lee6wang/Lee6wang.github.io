# Complete STM32 Bootloader and IAP Upgrade Solution (Beginner-Friendly Enhanced Edition)

*Let your MCU gain the ability to evolve by itself.*

> ### Project open-source address
> **GitHub:** https://github.com/Lee6wang/Master_BootLoader_App

![Project overview](/assets/figure/2025-12-08/1.png)

## Opening: Why Does Upgrading Your Device Feel Like Surgery?

If you have worked with STM32, you have probably experienced scenes like these:

- Firmware written incorrectly -> open the enclosure -> flash it -> close the enclosure -> find another bug -> open it again
- A customer reports a bug -> the product has already been shipped -> you carry a JTAG tool on-site for service
- A batch of devices needs upgrading -> you plug cables one by one like a manual production line

Every time you prepare to upgrade firmware, it feels like a doctor preparing for open-chest surgery:

- One small mistake may cause "cardiac arrest", which means the device becomes bricked.
- The operation is complicated and risky.
- The success rate depends heavily on manual skill.

At the same time, a phone OTA upgrade needs only one light tap:

**no reboot feeling, no disassembly, no obvious user disturbance, and the upgrade feels smooth.**

So the question is:

> **Why can a phone do this, but your STM32 cannot?**

Actually, it is not that STM32 cannot do it. It is that your system lacks a Bootloader plus IAP design.

This article is based on the project **Master_BootLoader_App** and walks through a real engineering-grade MCU upgrade system from scratch:

- What is a Bootloader?
- What is IAP?
- Why must Flash be partitioned?
- How can the device stay alive even if the upgrade fails?
- How does the host computer assist the system?
- What fatal pitfalls exist in real projects?

The goal is to let beginners who have never written a Bootloader get started quickly and build a real engineering understanding.

## Chapter 1: What Exactly Is a Bootloader?

Is a Bootloader mysterious?

Not really.

In one sentence:

> **Bootloader = the first "brain" after the MCU powers on.**  
> It tells the CPU: "Where should you execute code now?"

It is like an airport control tower:

- It checks the weather, meaning the device state.
- It checks the route, meaning whether an upgrade is needed.
- It directs the airplane to take off, meaning it jumps to the APP.
- It prevents accidents, meaning it avoids executing wrong firmware.

Without a Bootloader, after power-on the MCU can only be confused:

> "Am I the old APP? The new APP? Should I upgrade? Where should I run?"

Therefore, the Bootloader is like a reception manager in the program world:

1. **Welcome:** CPU has powered on.
2. **Check:** Should an upgrade be performed?
3. **Arrange the seat:** Jump to the APP to run.
4. **Prevent disorder:** If the APP is incomplete, do not run it.

![Bootloader concept](/assets/figure/2025-12-08/2.png)

The Bootloader does not handle business logic, but it controls the **life and death line** of the entire system.

An excellent Bootloader is the moat of the system.

## Chapter 2: IAP Is the Bootloader's Good Partner

The Bootloader decides "whether to install the new firmware".

The IAP_APP decides "how to receive the firmware and where to store it".

IAP stands for In-Application Programming. Literally, it means:

> **Updating the program itself while the application is running.**

The essential purpose of IAP is:

- No shutdown
- No disassembly
- No JTAG
- The device keeps working normally

It is like updating an app while still watching a video, without much interruption.

In modern industrial products, IAP is not an advanced feature. It is:

> **A basic capability required by any product that will be mass produced.**

Otherwise, hardware upgrades will keep wearing you down.

![IAP concept](/assets/figure/2025-12-08/3.png)

## Chapter 3: Flash Partitioning Is the Foundation of an Upgrade System

For a reliable upgrade system, the first problem to solve is not jumping code or serial protocol. It is:

> **How should Flash be partitioned?**

Why is partitioning necessary?

Because without partitioning:

- Writing firmware may overwrite the APP.
- A wrong address may erase the Bootloader.
- If the upgrade fails, the entire MCU may die.
- Without a temporary area, there is nowhere to store the firmware being received.

So Flash must be planned like rooms in a house.

The following is a typical engineering-grade partition structure:

![Flash partition](/assets/figure/2025-12-08/4.png)

Core principle:

> **The Bootloader must never be overwritten.**  
> **The APP area must remain safe during the upgrade process.**

The Download area is the key that prevents the whole system from turning into a brick.

## Chapter 4: Core Logic of the Bootloader

The following is the real Bootloader workflow used in engineering:

![Bootloader workflow](/assets/figure/2025-12-08/5.png)

### 1. Power-On -> Bootloader Runs First

At this point, it checks:

- Is there an upgrade flag?
- Does the Download area contain valid firmware, such as passing CRC?
- Is the old APP complete?

### 2. If Upgrade Is Needed -> Execute Upgrade Flow

The upgrade flow must be strict:

1. Erase the APP area.
2. Write the firmware from the Download area into the APP area page by page.
3. Perform CRC validation again on the new APP.
4. Update the version number.
5. Clear the upgrade flag.
6. Reboot.

What if the upgrade fails?

> **The Bootloader refuses to execute the invalid firmware and keeps the old APP safe.**

### 3. If Upgrade Is Not Needed -> Jump to APP

Jumping to the APP is one of the easiest places to introduce bugs in the whole Bootloader:

```c
__disable_irq();
__set_MSP(*(uint32_t*)APP_ADDR);
resetHandler = *(uint32_t*)(APP_ADDR + 4);
resetHandler();
```

If any step is missing, the APP may fail to run normally.

## Chapter 5: Firmware Receiving Flow of IAP_APP

The role of IAP_APP is:

> **Receive firmware packets steadily and write them into the Download area.**

A reliable firmware receiving process must include:

### Packetized Transmission

Each packet contains:

- Packet header
- Packet sequence number
- Data
- CRC check

For example:

```text
A5 5A|0001|256 bytes|CRC32
```

### Packet Number Verification

This can detect lost packets, wrong packets, and retransmitted packets.

### CRC Verification

CRC ensures data integrity.

### Flash Erase Before Write

Flash can only be written from 1 to 0. It must be erased before writing.

### Full-File CRC Calculation

This ensures the integrity of the whole firmware image.

### Set the Upgrade Flag

This tells the Bootloader:

> "I am ready."

The whole process must consider:

- Power loss
- Serial interference
- Host-side crash
- Unexpected reboot
- Interrupted packet transfer
- Wrong packet sequence number

A mature IAP system must ensure:

> **No matter what happens, receiving firmware must not kill the device.**

![Firmware receive flow](/assets/figure/2025-12-08/7.png)

## Chapter 6: The Communication Protocol Determines Whether the System Understands You

A communication protocol is not just "send some data casually".

A good upgrade protocol should provide:

### Packet Header for Synchronization

This prevents the MCU from receiving meaningless messy data.

### Packet Number for Order Checking

The MCU rejects out-of-order packets and skipped packets.

### Data-Length Field

This tells the MCU how many valid bytes are in the current packet.

### CRC Check

This is the most basic safety guarantee for data transmission.

### ACK/NACK Feedback

Every packet must receive clear feedback:

```text
ACK  -> Received.
NACK -> Please resend.
```

### Timeout Mechanism

If the MCU keeps waiting for the next packet and it never arrives, it must exit the upgrade flow to avoid getting stuck.

The protocol is the language of the upgrade system. If the language is unclear, the upgrade will fail.

## Chapter 7: Host Computer Tool (Python GUI)

In the entire upgrade system, the host computer connects all flows together. Its mission is simple:

**make the upgrade simple and reliable.**

### Main Responsibilities of the Host Computer

- **Firmware packetization:** Split the `.bin` file into small blocks so the MCU can receive it packet by packet.
- **Standardized sending:** Send packets according to the protocol format, including packet header, packet number, data, CRC, and so on.
- **Waiting for response:** Wait for MCU ACK/NACK for each packet to ensure correct transfer.
- **Automatic retransmission:** Resend automatically when packet loss or check failure occurs, improving stability.
- **Status visualization:** Use progress bars and logs to show the upgrade progress clearly.

The final experience becomes smooth:

> **Select firmware -> click send -> wait for upgrade completion**

No enclosure disassembly, no JTAG, and no constant fear of failure. Everything is under control.

![Python GUI](/assets/figure/2025-12-08/9.png)

## Chapter 8: Full Upgrade Flow Overview

The overall upgrade flow is:

```text
Host computer -> packetize and send firmware
IAP_APP -> receive packets and write them into the Download area
IAP_APP -> write upgrade flag -> reboot
Bootloader -> check flag -> verify new firmware
Bootloader -> write into APP area -> verify
Bootloader -> start new APP
```

![Full upgrade flow](/assets/figure/2025-12-08/10.png)

System behavior:

**Failure at any step will not affect the old APP from running.**

## Chapter 9: Engineering Experience (Pitfall Guide)

Writing Bootloader + IAP is not hard.

The hard part is writing it so it is stable, mass-producible, and resistant to failure.

Below are the most common, most fatal, and most easily ignored pitfalls in engineering.

### 1. Making the Bootloader Too Complicated

- The Bootloader should be small, stable, and precise. Do not put business logic into it.
- More functions mean higher risk and more painful debugging.
- Engineering principle: **write as little Bootloader code as possible.**

### 2. Forgetting to Disable Interrupts Before Jumping to APP

- Common symptoms: APP cannot start, execution goes wild, or HardFault appears.
- NVIC interrupts must be disabled, SysTick must be stopped, and peripheral state should be cleaned.
- Principle: **before jumping, restore the MCU to a clean state as much as possible.**

### 3. Erasing Flash Without Following Sectors or Pages

- STM32 does not support byte-level erase.
- Erase must be performed by sector or page.
- Wrong erase behavior may cause write failure, CRC error, or APP crash.

### 4. Download Area Is Too Small

- Firmware is often larger than initially expected.
- The Download area must be **greater than or equal to the APP area size**.
- Insufficient reserved space causes upgrade interruption and permanent failure.

### 5. No Rollback Mechanism on Upgrade Failure

- The most serious engineering accident is: **upgrade failure -> device cannot boot**.
- Basic guarantees:
  - The Bootloader must ensure that valid firmware exists in the APP area.
  - Incomplete or illegal firmware must never be executed.
- Principle: **the system must always be able to boot alive.**

### 6. The Protocol Is Too Rough and Does Not Support Retransmission

- Without ACK/NACK, the upgrade relies on luck.
- Serial interference, noise, and packet loss can all damage firmware.
- Industrial-grade systems must support:
  - Packet sequence number
  - Retransmission after check failure
  - Timeout exit

### 7. Poor Meta-Information Area Design

- Flags, version numbers, firmware length, and other metadata must be stored reliably.
- If metadata is written incorrectly, lost, or erased improperly, the Bootloader will make wrong decisions.
- Best practice:
  - Use a separate Meta partition.
  - Use redundancy and validation mechanisms.

### 8. APP Does Not Implement Upgrade Protection

- When receiving firmware, the APP must write the Download area in order.
- The APP must not directly write the APP area.
- Principle: **do not touch the official firmware area during the receiving stage.**

### 9. Serial Baud Rate Too High and Stability Too Poor

- High baud rates are more likely to lose packets and introduce noise.
- Recommended choices:
  - Stable engineering value: 115200
  - Faster option: 460800, but still requires testing
- Upgrade success rate is always more important than speed.

### 10. Forgetting to Test Power-Loss Scenarios

Must-test cases:

- Power loss halfway through transmission
- Download area damaged
- Meta area erased
- APP area empty

The self-requirement of a reliable Bootloader is:

> **No matter how the user interrupts it, the system must not die.**

## Chapter 10: Summary

If you have read this far, you already understand the key points of a mature upgrade system:

- The Bootloader decides whether to install.
- IAP_APP decides how firmware is received.
- Flash partitioning decides whether the upgrade can be safe.
- The protocol decides whether data is reliable.
- Engineering experience decides whether the system is stable enough.
- Advanced expansion decides whether future OTA and scalable deployment are possible.

In one sentence:

> **An engineer who can write a Bootloader is not just an ordinary engineer, but someone who can protect the whole system from the bottom up.**

And **Master_BootLoader_App** is an evolutionary step from "being able to write programs" to "being able to build engineering systems".
