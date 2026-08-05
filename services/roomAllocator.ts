import { Student, Room, GenderType, WaveType } from '@/types';

export class RoomAllocatorEngine {
  /**
   * Automatically allocates unassigned students to rooms based on capacity, wave, and gender.
   */
  public static autoAllocateRooms(
    students: Student[],
    roomCapacity: number = 3
  ): { updatedStudents: Student[]; rooms: Room[] } {
    const updated = [...students];
    const roomMap: Map<string, Room> = new Map();
    let currentRoomId = 1;

    // Separate students by Wave and Gender
    const waves: WaveType[] = ['BALI_GEL_1', 'BALI_GEL_2', 'YOGYA_GEL_1'];
    const genders: GenderType[] = ['LAKI-LAKI', 'PEREMPUAN'];

    waves.forEach((wave) => {
      genders.forEach((gender) => {
        // Filter students for this wave & gender who are registered
        const pool = updated.filter(
          (s) => s.isRegistered && s.wave === wave && s.gender === gender
        );

        if (pool.length === 0) return;

        // Group by class to keep classmates together
        const classGroups: Map<string, Student[]> = new Map();
        pool.forEach((student) => {
          const list = classGroups.get(student.className) || [];
          list.push(student);
          classGroups.set(student.className, list);
        });

        let currentRoomStudents: Student[] = [];
        let roomNum = currentRoomId;

        classGroups.forEach((groupStudents) => {
          groupStudents.forEach((student) => {
            currentRoomStudents.push(student);
            student.roomNumber = roomNum;

            if (currentRoomStudents.length === roomCapacity) {
              const roomId = `room-${wave}-${roomNum}`;
              roomMap.set(roomId, {
                id: roomId,
                roomNumber: roomNum,
                gender,
                capacity: roomCapacity,
                wave,
                assignedStudentIds: currentRoomStudents.map((s) => s.id),
              });
              roomNum++;
              currentRoomStudents = [];
            }
          });
        });

        // Remainder room
        if (currentRoomStudents.length > 0) {
          const roomId = `room-${wave}-${roomNum}`;
          roomMap.set(roomId, {
            id: roomId,
            roomNumber: roomNum,
            gender,
            capacity: roomCapacity,
            wave,
            assignedStudentIds: currentRoomStudents.map((s) => s.id),
          });
          roomNum++;
        }

        currentRoomId = roomNum + 1;
      });
    });

    return {
      updatedStudents: updated,
      rooms: Array.from(roomMap.values()),
    };
  }

  /**
   * Generates room views from student assignments.
   */
  public static deriveRoomsFromStudents(students: Student[], capacity: number = 3): Room[] {
    const roomsMap = new Map<number, Room>();

    students.forEach((s) => {
      if (!s.roomNumber || !s.wave) return;
      const roomNum = s.roomNumber;
      if (!roomsMap.has(roomNum)) {
        roomsMap.set(roomNum, {
          id: `room-${roomNum}`,
          roomNumber: roomNum,
          gender: s.gender,
          capacity,
          wave: s.wave,
          assignedStudentIds: [],
        });
      }
      roomsMap.get(roomNum)!.assignedStudentIds.push(s.id);
    });

    return Array.from(roomsMap.values()).sort((a, b) => a.roomNumber - b.roomNumber);
  }
}
