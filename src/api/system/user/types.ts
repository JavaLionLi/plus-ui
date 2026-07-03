import type { DeptVO } from '@/api/system/dept/types';
import type { PostVO } from '@/api/system/post/types';
import type { RoleVO } from '@/api/system/role/types';
import type { BaseEntity, PageQuery } from '@/api/types';

export interface UserInfo {
  user: {
    userId: string | number;
    userName: string;
    nickName?: string;
    avatar?: string | number;
    avatarUrl?: string;
    deptName?: string;
  };
  roles: string[];
  permissions: string[];
}

export interface UserForm {
  userId?: string | number;
  deptId?: number | string;
  userName?: string;
  nickName?: string;
  password?: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  status?: string;
  remark?: string;
  avatar?: string | number;
  postIds?: Array<string | number>;
  roleIds?: Array<string | number>;
}

export interface UserProfileForm {
  nickName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  avatar?: string | number;
}

export interface UserInfoVO {
  user?: UserVO;
  roles: RoleVO[];
  roleIds: Array<string | number>;
  posts: PostVO[];
  postIds: Array<string | number>;
  roleGroup?: string;
  postGroup?: string;
}

export interface UserQuery extends PageQuery {
  userName?: string;
  nickName?: string;
  phoneNumber?: string;
  status?: string;
  deptId?: string | number;
  roleId?: string | number;
  userIds?: string | number;
}

export interface UserVO extends BaseEntity {
  userId?: string | number;
  tenantId?: string;
  deptId?: number | string;
  userName?: string;
  nickName?: string;
  userType?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  avatar?: string | number;
  avatarUrl?: string;
  status?: string;
  deptName?: string;
  roles?: RoleVO[];
  admin?: boolean;
  loginIp?: string;
  loginDate?: string;
  dept?: DeptVO;
}
