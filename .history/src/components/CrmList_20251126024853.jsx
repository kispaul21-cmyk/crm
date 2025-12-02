className = {`group p-4 border-b cursor-pointer hover:bg-white transition-all ${selectedDeal?.id === deal.id ? 'bg-white border-l-4 border-l-blue-500 shadow-md' : 'border-l-4 border-l-transparent'}`}
          >
            <div className="font-bold text-sm text-slate-700 mb-1">{deal.title}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Briefcase size={12} />
              <span className="truncate">{deal.company_name}</span>
            </div>
          </div >
        ))}
      </div >
    </div >
  );
};

export default CrmList;