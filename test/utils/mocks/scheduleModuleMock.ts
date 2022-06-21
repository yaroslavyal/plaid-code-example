import { Module } from '@nestjs/common';

@Module({})
class MockModule {}

const scheduleMock = jest.mock('@nestjs/schedule', () => {
  const originalModule = jest.requireActual('@nestjs/schedule');
  return {
    __esModule: true,
    ...originalModule,
    ScheduleModule: {
      forRoot: jest.fn().mockImplementation(() => MockModule),
    },
  };
});

export default scheduleMock;
