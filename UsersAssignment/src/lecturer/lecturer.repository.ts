import { Lecturer } from "./lecturer.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class LecturerRepository {
  constructor(
    @InjectRepository(Lecturer)
    private readonly repo: Repository<Lecturer>,
  ) { }

  async findById(id: number): Promise<Lecturer | null> {
    return this.repo.findOne({ where: { id } });
  }

  // Thỏa mãn: Xem danh sách giảng viên kèm chuyên môn
  async findAll(): Promise<Lecturer[] | null> {
    return this.repo.find();
  }

  async save(lecturer: Lecturer): Promise<Lecturer | null> {
    return this.repo.save(lecturer);
  }
  async updateStatus(id: number, status: string): Promise<void> {
    await this.repo.update(id, { status: status as any });
  }
  async createLecturer(data: {
    lecturerId: number,
    email: string,
    fullname?: string;        // optional
    lecturerCode?: string;   // optional
    status?: string;
  }) {
    this.repo.create({
      id: data.lecturerId,
      email: data.email,
      fullname: data.fullname,              // có thể undefined
      status: data.status ?? 'ACTIVE',      // nếu không truyền thì mặc định ACTIVE
      lecturerCode: data.lecturerCode,    // có thể undefined
    });
  }

  async delete(userId: number) {
    return this.repo.delete(userId);
  }
}