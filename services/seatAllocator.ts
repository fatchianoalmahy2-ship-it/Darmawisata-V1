import { Student, Bus, WaveType } from '@/types';

export class SeatAllocatorEngine {
  /**
   * Auto allocates bus seats for students in a specific wave.
   */
  public static autoAllocateBuses(
    students: Student[],
    busCapacity: number = 50
  ): { updatedStudents: Student[]; buses: Bus[] } {
    const updated = [...students];
    const buses: Bus[] = [];

    const waves: WaveType[] = ['BALI_GEL_1', 'BALI_GEL_2', 'YOGYA_GEL_1'];

    waves.forEach((wave) => {
      const waveStudents = updated.filter((s) => s.isRegistered && s.wave === wave);
      if (waveStudents.length === 0) return;

      // Group students by class
      const classMap = new Map<string, Student[]>();
      waveStudents.forEach((st) => {
        const list = classMap.get(st.className) || [];
        list.push(st);
        classMap.set(st.className, list);
      });

      let currentBusNum = 1;
      let currentSeatNum = 3; // Seats 1 and 2 usually reserved for Tour Guides / Teachers
      let currentBusAssignedIds: string[] = [];

      classMap.forEach((classStudents) => {
        classStudents.forEach((student) => {
          if (currentSeatNum > busCapacity) {
            // Push current bus
            buses.push({
              id: `bus-${wave}-${currentBusNum}`,
              busNumber: currentBusNum,
              wave,
              capacity: busCapacity,
              guide1: 'Guru Pendamping 1',
              guide2: 'Guru Pendamping 2',
              assignedStudentIds: currentBusAssignedIds,
            });

            currentBusNum++;
            currentSeatNum = 3;
            currentBusAssignedIds = [];
          }

          student.busNumber = currentBusNum;
          student.seatNumber = currentSeatNum;
          currentBusAssignedIds.push(student.id);
          currentSeatNum++;
        });
      });

      if (currentBusAssignedIds.length > 0) {
        buses.push({
          id: `bus-${wave}-${currentBusNum}`,
          busNumber: currentBusNum,
          wave,
          capacity: busCapacity,
          guide1: 'Guru Pendamping 1',
          guide2: 'Guru Pendamping 2',
          assignedStudentIds: currentBusAssignedIds,
        });
      }
    });

    return { updatedStudents: updated, buses };
  }

  /**
   * Returns list of buses derived from students' bus numbers.
   */
  public static deriveBusesFromStudents(students: Student[], busCapacity: number = 50): Bus[] {
    const busMap = new Map<number, Bus>();

    students.forEach((s) => {
      if (!s.busNumber || !s.wave) return;
      const bNum = s.busNumber;
      if (!busMap.has(bNum)) {
        busMap.set(bNum, {
          id: `bus-${bNum}`,
          busNumber: bNum,
          wave: s.wave,
          capacity: busCapacity,
          guide1: 'Guru Pendamping 1',
          guide2: 'Guru Pendamping 2',
          assignedStudentIds: [],
        });
      }
      busMap.get(bNum)!.assignedStudentIds.push(s.id);
    });

    return Array.from(busMap.values()).sort((a, b) => a.busNumber - b.busNumber);
  }
}
