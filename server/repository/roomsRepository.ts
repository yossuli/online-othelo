import type { RoomModel } from '$/commonTypesWithClient/models';
import { roomIdParser } from '$/service/idParsers';
import { prismaClient } from '$/service/prismaClient';
import type { Room } from '@prisma/client';
import { z } from 'zod';

const toRoomModel = (prismaRoom: Room): RoomModel => ({
  id: roomIdParser.parse(prismaRoom.roomId),
  board: z.array(z.array(z.number())).parse(prismaRoom.board),
  turn: z.number().parse(prismaRoom.turn),
  passCount: z.number().parse(prismaRoom.passCount),
  status: z.enum(['waiting', 'playing', 'ended']).parse(prismaRoom.status),
  created: prismaRoom.createdAt.getTime(),
});

export const roomsRepository = {
  save: async (room: RoomModel) => {
    await prismaClient.room.upsert({
      where: { roomId: room.id },
      update: {
        status: room.status,
        board: room.board,
        turn: room.turn,
        passCount: room.passCount,
      },
      create: {
        roomId: room.id,
        board: room.board,
        turn: room.turn,
        passCount: room.passCount,
        status: room.status,
        createdAt: new Date(room.created),
      },
    });
  },
  findLatest: async (): Promise<RoomModel | null> => {
    const room = await prismaClient.room.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    console.log('turn', room?.turn, 'passCount', room?.passCount);
    return room && toRoomModel(room);
  },
};
