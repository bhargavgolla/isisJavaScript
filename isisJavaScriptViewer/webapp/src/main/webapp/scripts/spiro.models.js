var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Spiro;
(function (Spiro) {
    function isScalarType(typeName) {
        return typeName === "string" || typeName === "number" || typeName === "boolean" || typeName === "integer";
    }

    var Rel = (function () {
        function Rel(asString) {
            this.asString = asString;
            this.ns = "";
            this.parms = [];
            this.decomposeRel();
        }
        Rel.prototype.decomposeRel = function () {
            var postFix;

            if (this.asString.substring(0, 3) === "urn") {
                this.ns = this.asString.substring(0, this.asString.indexOf("/") + 1);
                postFix = this.asString.substring(this.asString.indexOf("/") + 1);
            } else {
                postFix = this.asString;
            }

            var splitPostFix = postFix.split(";");

            this.uniqueValue = splitPostFix[0];

            if (splitPostFix.length > 1) {
                this.parms = splitPostFix.slice(1);
            }
        };
        return Rel;
    })();
    Spiro.Rel = Rel;

    var MediaType = (function () {
        function MediaType(asString) {
            this.asString = asString;
            this.decomposeMediaType();
        }
        MediaType.prototype.decomposeMediaType = function () {
            var parms = this.asString.split(";");

            if (parms.length > 0) {
                this.applicationType = parms[0];
            }

            for (var i = 1; i < parms.length; i++) {
                if ($.trim(parms[i]).substring(0, 7) === "profile") {
                    this.profile = $.trim(parms[i]);
                    var profileValue = $.trim(this.profile.split("=")[1].replace(/\"/g, ''));
                    this.representationType = $.trim(profileValue.split("/")[1]);
                }
                if ($.trim(parms[i]).substring(0, 16) === "x-ro-domain-type") {
                    this.xRoDomainType = $.trim(parms[i]);
                    this.domainType = $.trim(this.xRoDomainType.split("=")[1].replace(/\"/g, ''));
                }
            }
        };
        return MediaType;
    })();
    Spiro.MediaType = MediaType;

    var Value = (function () {
        function Value(raw) {
            if (raw instanceof Link) {
                this.wrapped = raw;
            } else if (raw && raw.href) {
                this.wrapped = new Link(raw);
            } else {
                this.wrapped = raw;
            }
        }
        Value.prototype.isReference = function () {
            return this.wrapped instanceof Link;
        };

        Value.prototype.isNull = function () {
            return this.wrapped == null;
        };

        Value.prototype.link = function () {
            if (this.isReference()) {
                return this.wrapped;
            }
            return null;
        };

        Value.prototype.scalar = function () {
            if (this.isReference()) {
                return null;
            }
            return this.wrapped;
        };

        Value.prototype.toString = function () {
            if (this.isReference()) {
                return this.link().title();
            }
            return (this.wrapped == null) ? "" : this.wrapped.toString();
        };

        Value.prototype.toValueString = function () {
            if (this.isReference()) {
                return this.link().href();
            }
            return (this.wrapped == null) ? "" : this.wrapped.toString();
        };

        Value.prototype.set = function (target, name) {
            if (name) {
                var t = target[name] = {};
                this.set(t);
            } else {
                if (this.isReference()) {
                    target["value"] = { "href": this.link().href() };
                } else {
                    target["value"] = this.scalar();
                }
            }
        };
        return Value;
    })();
    Spiro.Value = Value;

    var Result = (function () {
        function Result(wrapped, resultType) {
            this.wrapped = wrapped;
            this.resultType = resultType;
        }
        Result.prototype.object = function () {
            if (!this.isNull() && this.resultType == "object") {
                return new DomainObjectRepresentation(this.wrapped);
            }
            return null;
        };

        Result.prototype.list = function () {
            if (!this.isNull() && this.resultType == "list") {
                return new ListRepresentation(this.wrapped);
            }
            return null;
        };

        Result.prototype.scalar = function () {
            if (!this.isNull() && this.resultType == "scalar") {
                return new ScalarValueRepresentation(this.wrapped);
            }
            return null;
        };

        Result.prototype.isNull = function () {
            return this.wrapped == null;
        };

        Result.prototype.isVoid = function () {
            return (this.resultType == "void");
        };
        return Result;
    })();
    Spiro.Result = Result;

    var NestedRepresentation = (function () {
        function NestedRepresentation(wrapped) {
            this.wrapped = wrapped;
        }
        NestedRepresentation.prototype.links = function () {
            return Links.WrapLinks(this.wrapped.links);
        };

        NestedRepresentation.prototype.extensions = function () {
            return this.wrapped.extensions;
        };
        return NestedRepresentation;
    })();
    Spiro.NestedRepresentation = NestedRepresentation;

    var HateoasModelBase = (function (_super) {
        __extends(HateoasModelBase, _super);
        function HateoasModelBase(object) {
            _super.call(this, object);
        }
        HateoasModelBase.prototype.onError = function (map, statusCode, warnings) {
            return new ErrorMap(map, statusCode, warnings);
        };
        return HateoasModelBase;
    })(Spiro.HateoasModelBaseShim);
    Spiro.HateoasModelBase = HateoasModelBase;

    var ErrorMap = (function (_super) {
        __extends(ErrorMap, _super);
        function ErrorMap(map, statusCode, warningMessage) {
            _super.call(this, map);
            this.statusCode = statusCode;
            this.warningMessage = warningMessage;
        }
        ErrorMap.prototype.values = function () {
            var vs = {};

            for (var v in this.attributes) {
                if (this.attributes[v].hasOwnProperty("value")) {
                    var ev = {
                        value: new Value(this.attributes[v].value),
                        invalidReason: this.attributes[v].invalidReason
                    };
                    vs[v] = ev;
                }
            }

            return vs;
        };

        ErrorMap.prototype.invalidReason = function () {
            return this.get("x-ro-invalid-reason");
        };
        return ErrorMap;
    })(HateoasModelBase);
    Spiro.ErrorMap = ErrorMap;

    var UpdateMap = (function (_super) {
        __extends(UpdateMap, _super);
        function UpdateMap(domainObject, map) {
            _super.call(this, map, domainObject, domainObject.instanceId());
            this.domainObject = domainObject;

            domainObject.updateLink().copyToHateoasModel(this);

            for (var member in this.properties()) {
                var currentValue = domainObject.propertyMembers()[member].value();
                this.setProperty(member, currentValue);
            }
        }
        UpdateMap.prototype.onChange = function () {
            this.domainObject.setFromUpdateMap(this);
        };

        UpdateMap.prototype.onError = function (map, statusCode, warnings) {
            return new ErrorMap(map, statusCode, warnings);
        };

        UpdateMap.prototype.properties = function () {
            var pps = {};

            for (var p in this.attributes) {
                pps[p] = new Value(this.attributes[p].value);
            }

            return pps;
        };

        UpdateMap.prototype.setProperty = function (name, value) {
            value.set(this.attributes, name);
        };
        return UpdateMap;
    })(Spiro.ArgumentMap);
    Spiro.UpdateMap = UpdateMap;

    var AddToRemoveFromMap = (function (_super) {
        __extends(AddToRemoveFromMap, _super);
        function AddToRemoveFromMap(collectionResource, map, add) {
            _super.call(this, map, collectionResource, collectionResource.instanceId());
            this.collectionResource = collectionResource;

            var link = add ? collectionResource.addToLink() : collectionResource.removeFromLink();

            link.copyToHateoasModel(this);
        }
        AddToRemoveFromMap.prototype.onChange = function () {
            this.collectionResource.setFromMap(this);
        };

        AddToRemoveFromMap.prototype.onError = function (map, statusCode, warnings) {
            return new ErrorMap(map, statusCode, warnings);
        };

        AddToRemoveFromMap.prototype.setValue = function (value) {
            value.set(this.attributes);
        };
        return AddToRemoveFromMap;
    })(Spiro.ArgumentMap);
    Spiro.AddToRemoveFromMap = AddToRemoveFromMap;

    var ModifyMap = (function (_super) {
        __extends(ModifyMap, _super);
        function ModifyMap(propertyResource, map) {
            _super.call(this, map, propertyResource, propertyResource.instanceId());
            this.propertyResource = propertyResource;

            propertyResource.modifyLink().copyToHateoasModel(this);

            this.setValue(propertyResource.value());
        }
        ModifyMap.prototype.onChange = function () {
            this.propertyResource.setFromModifyMap(this);
        };

        ModifyMap.prototype.onError = function (map, statusCode, warnings) {
            return new ErrorMap(map, statusCode, warnings);
        };

        ModifyMap.prototype.setValue = function (value) {
            value.set(this.attributes);
        };
        return ModifyMap;
    })(Spiro.ArgumentMap);
    Spiro.ModifyMap = ModifyMap;

    var ClearMap = (function (_super) {
        __extends(ClearMap, _super);
        function ClearMap(propertyResource) {
            _super.call(this, {}, propertyResource, propertyResource.instanceId());

            propertyResource.clearLink().copyToHateoasModel(this);
        }
        ClearMap.prototype.onError = function (map, statusCode, warnings) {
            return new ErrorMap(map, statusCode, warnings);
        };
        return ClearMap;
    })(Spiro.ArgumentMap);
    Spiro.ClearMap = ClearMap;

    var Links = (function (_super) {
        __extends(Links, _super);
        function Links() {
            _super.call(this);
            this.model = Link;
        }
        Links.prototype.url = function () {
            return this.hateoasUrl || _super.prototype.url.call(this);
        };

        Links.prototype.parse = function (response) {
            return response.value;
        };

        Links.WrapLinks = function (links) {
            var ll = new Links();
            ll.add(links);
            return ll;
        };

        Links.prototype.getLinkByRel = function (rel) {
            return _.find(this.models, function (i) {
                return i.rel().uniqueValue === rel.uniqueValue;
            });
        };

        Links.prototype.linkByRel = function (rel) {
            return this.getLinkByRel(new Rel(rel));
        };
        return Links;
    })(Spiro.CollectionShim);
    Spiro.Links = Links;

    var ResourceRepresentation = (function (_super) {
        __extends(ResourceRepresentation, _super);
        function ResourceRepresentation(object) {
            _super.call(this, object);
        }
        ResourceRepresentation.prototype.links = function () {
            this.lazyLinks = this.lazyLinks || Links.WrapLinks(this.get("links"));
            return this.lazyLinks;
        };

        ResourceRepresentation.prototype.extensions = function () {
            return this.get("extensions");
        };
        return ResourceRepresentation;
    })(HateoasModelBase);
    Spiro.ResourceRepresentation = ResourceRepresentation;

    var ActionResultRepresentation = (function (_super) {
        __extends(ActionResultRepresentation, _super);
        function ActionResultRepresentation(object) {
            _super.call(this, object);
        }
        ActionResultRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        ActionResultRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        ActionResultRepresentation.prototype.resultType = function () {
            return this.get("resultType");
        };

        ActionResultRepresentation.prototype.result = function () {
            return new Result(this.get("result"), this.resultType());
        };

        ActionResultRepresentation.prototype.setParameter = function (name, value) {
            value.set(this.attributes, name);
        };
        return ActionResultRepresentation;
    })(ResourceRepresentation);
    Spiro.ActionResultRepresentation = ActionResultRepresentation;

    var Parameter = (function (_super) {
        __extends(Parameter, _super);
        function Parameter(wrapped, parent) {
            _super.call(this, wrapped);
            this.parent = parent;
        }
        Parameter.prototype.choices = function () {
            if (this.wrapped.choices) {
                return _.map(this.wrapped.choices, function (item) {
                    return new Value(item);
                });
            }
            return null;
        };

        Parameter.prototype.default = function () {
            return new Value(this.wrapped.default);
        };

        Parameter.prototype.isScalar = function () {
            return isScalarType(this.extensions().returnType);
        };
        return Parameter;
    })(NestedRepresentation);
    Spiro.Parameter = Parameter;

    var ActionRepresentation = (function (_super) {
        __extends(ActionRepresentation, _super);
        function ActionRepresentation() {
            _super.apply(this, arguments);
        }
        ActionRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        ActionRepresentation.prototype.upLink = function () {
            return this.links().linkByRel("up");
        };

        ActionRepresentation.prototype.invokeLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/invoke");
        };

        ActionRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        ActionRepresentation.prototype.getUp = function () {
            return this.upLink().getTarget();
        };

        ActionRepresentation.prototype.getInvoke = function () {
            return this.invokeLink().getTarget();
        };

        ActionRepresentation.prototype.actionId = function () {
            return this.get("id");
        };

        ActionRepresentation.prototype.initParameterMap = function () {
            if (!this.parameterMap) {
                this.parameterMap = {};

                var parameters = this.get("parameters");

                for (var m in parameters) {
                    var parameter = new Parameter(parameters[m], this);
                    this.parameterMap[m] = parameter;
                }
            }
        };

        ActionRepresentation.prototype.parameters = function () {
            this.initParameterMap();
            return this.parameterMap;
        };

        ActionRepresentation.prototype.disabledReason = function () {
            return this.get("disabledReason");
        };
        return ActionRepresentation;
    })(ResourceRepresentation);
    Spiro.ActionRepresentation = ActionRepresentation;

    var CollectionRepresentation = (function (_super) {
        __extends(CollectionRepresentation, _super);
        function CollectionRepresentation() {
            _super.apply(this, arguments);
        }
        CollectionRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        CollectionRepresentation.prototype.upLink = function () {
            return this.links().linkByRel("up");
        };

        CollectionRepresentation.prototype.addToLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/add-to");
        };

        CollectionRepresentation.prototype.removeFromLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/remove-from");
        };

        CollectionRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        CollectionRepresentation.prototype.getUp = function () {
            return this.upLink().getTarget();
        };

        CollectionRepresentation.prototype.setFromMap = function (map) {
            this.set(map.attributes);
        };

        CollectionRepresentation.prototype.addToMap = function () {
            return this.addToLink().arguments();
        };

        CollectionRepresentation.prototype.getAddToMap = function () {
            if (this.addToLink()) {
                return new AddToRemoveFromMap(this, this.addToMap(), true);
            }
            return null;
        };

        CollectionRepresentation.prototype.removeFromMap = function () {
            return this.removeFromLink().arguments();
        };

        CollectionRepresentation.prototype.getRemoveFromMap = function () {
            if (this.removeFromLink()) {
                return new AddToRemoveFromMap(this, this.removeFromMap(), false);
            }
            return null;
        };

        CollectionRepresentation.prototype.instanceId = function () {
            return this.get("id");
        };

        CollectionRepresentation.prototype.value = function () {
            return Links.WrapLinks(this.get("value"));
        };

        CollectionRepresentation.prototype.disabledReason = function () {
            return this.get("disabledReason");
        };
        return CollectionRepresentation;
    })(ResourceRepresentation);
    Spiro.CollectionRepresentation = CollectionRepresentation;

    var PropertyRepresentation = (function (_super) {
        __extends(PropertyRepresentation, _super);
        function PropertyRepresentation() {
            _super.apply(this, arguments);
        }
        PropertyRepresentation.prototype.modifyLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/modify");
        };

        PropertyRepresentation.prototype.clearLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/clear");
        };

        PropertyRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        PropertyRepresentation.prototype.upLink = function () {
            return this.links().linkByRel("up");
        };

        PropertyRepresentation.prototype.modifyMap = function () {
            return this.modifyLink().arguments();
        };

        PropertyRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        PropertyRepresentation.prototype.getUp = function () {
            return this.upLink().getTarget();
        };

        PropertyRepresentation.prototype.setFromModifyMap = function (map) {
            this.set(map.attributes);
        };

        PropertyRepresentation.prototype.getModifyMap = function () {
            if (this.modifyLink()) {
                return new ModifyMap(this, this.modifyMap());
            }
            return null;
        };

        PropertyRepresentation.prototype.getClearMap = function () {
            if (this.clearLink()) {
                return new ClearMap(this);
            }
            return null;
        };

        PropertyRepresentation.prototype.instanceId = function () {
            return this.get("id");
        };

        PropertyRepresentation.prototype.value = function () {
            return new Value(this.get("value"));
        };

        PropertyRepresentation.prototype.choices = function () {
            var ch = this.get("choices");
            if (ch) {
                return _.map(ch, function (item) {
                    return new Value(item);
                });
            }
            return null;
        };

        PropertyRepresentation.prototype.disabledReason = function () {
            return this.get("disabledReason");
        };

        PropertyRepresentation.prototype.isScalar = function () {
            return isScalarType(this.extensions().returnType);
        };
        return PropertyRepresentation;
    })(ResourceRepresentation);
    Spiro.PropertyRepresentation = PropertyRepresentation;

    var Member = (function (_super) {
        __extends(Member, _super);
        function Member(wrapped, parent) {
            _super.call(this, wrapped);
            this.parent = parent;
        }
        Member.prototype.update = function (newValue) {
            this.wrapped = newValue;
        };

        Member.prototype.memberType = function () {
            return this.wrapped.memberType;
        };

        Member.prototype.detailsLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/details");
        };

        Member.prototype.disabledReason = function () {
            return this.wrapped.disabledReason;
        };

        Member.prototype.isScalar = function () {
            return isScalarType(this.extensions().returnType);
        };

        Member.WrapMember = function (toWrap, parent) {
            if (toWrap.memberType === "property") {
                return new PropertyMember(toWrap, parent);
            }

            if (toWrap.memberType === "collection") {
                return new CollectionMember(toWrap, parent);
            }

            if (toWrap.memberType === "action") {
                return new ActionMember(toWrap, parent);
            }

            return null;
        };
        return Member;
    })(NestedRepresentation);
    Spiro.Member = Member;

    var PropertyMember = (function (_super) {
        __extends(PropertyMember, _super);
        function PropertyMember(wrapped, parent) {
            _super.call(this, wrapped, parent);
        }
        PropertyMember.prototype.value = function () {
            return new Value(this.wrapped.value);
        };

        PropertyMember.prototype.update = function (newValue) {
            _super.prototype.update.call(this, newValue);
        };

        PropertyMember.prototype.getDetails = function () {
            return this.detailsLink().getTarget();
        };
        return PropertyMember;
    })(Member);
    Spiro.PropertyMember = PropertyMember;

    var CollectionMember = (function (_super) {
        __extends(CollectionMember, _super);
        function CollectionMember(wrapped, parent) {
            _super.call(this, wrapped, parent);
        }
        CollectionMember.prototype.value = function () {
            if (this.wrapped.value && this.wrapped.value.length) {
                var valueArray = [];

                for (var i = 0; i < this.wrapped.value.length; i++) {
                    valueArray[i] = new DomainObjectRepresentation(this.wrapped.value[i]);
                }

                return valueArray;
            }
            return [];
        };

        CollectionMember.prototype.size = function () {
            return this.wrapped.size;
        };

        CollectionMember.prototype.getDetails = function () {
            return this.detailsLink().getTarget();
        };
        return CollectionMember;
    })(Member);
    Spiro.CollectionMember = CollectionMember;

    var ActionMember = (function (_super) {
        __extends(ActionMember, _super);
        function ActionMember(wrapped, parent) {
            _super.call(this, wrapped, parent);
        }
        ActionMember.prototype.getDetails = function () {
            return this.detailsLink().getTarget();
        };
        return ActionMember;
    })(Member);
    Spiro.ActionMember = ActionMember;

    var DomainObjectRepresentation = (function (_super) {
        __extends(DomainObjectRepresentation, _super);
        function DomainObjectRepresentation(object) {
            _super.call(this, object);
            this.url = this.getUrl;
        }
        DomainObjectRepresentation.prototype.getUrl = function () {
            return this.hateoasUrl || this.selfLink().href() || _super.prototype.url.call(this);
        };

        DomainObjectRepresentation.prototype.title = function () {
            return this.get("title");
        };

        DomainObjectRepresentation.prototype.domainType = function () {
            return this.get("domainType");
        };

        DomainObjectRepresentation.prototype.serviceId = function () {
            return this.get("serviceId");
        };

        DomainObjectRepresentation.prototype.links = function () {
            return Links.WrapLinks(this.get("links"));
        };

        DomainObjectRepresentation.prototype.instanceId = function () {
            return this.get("instanceId");
        };

        DomainObjectRepresentation.prototype.extensions = function () {
            return this.get("extensions");
        };

        DomainObjectRepresentation.prototype.resetMemberMaps = function () {
            this.memberMap = {};
            this.propertyMemberMap = {};
            this.collectionMemberMap = {};
            this.actionMemberMap = {};

            var members = this.get("members");

            for (var m in members) {
                var member = Member.WrapMember(members[m], this);
                this.memberMap[m] = member;

                if (member.memberType() === "property") {
                    this.propertyMemberMap[m] = member;
                } else if (member.memberType() === "collection") {
                    this.collectionMemberMap[m] = member;
                } else if (member.memberType() === "action") {
                    this.actionMemberMap[m] = member;
                }
            }
        };

        DomainObjectRepresentation.prototype.initMemberMaps = function () {
            if (!this.memberMap) {
                this.resetMemberMaps();
            }
        };

        DomainObjectRepresentation.prototype.members = function () {
            this.initMemberMaps();
            return this.memberMap;
        };

        DomainObjectRepresentation.prototype.propertyMembers = function () {
            this.initMemberMaps();
            return this.propertyMemberMap;
        };

        DomainObjectRepresentation.prototype.collectionMembers = function () {
            this.initMemberMaps();
            return this.collectionMemberMap;
        };

        DomainObjectRepresentation.prototype.actionMembers = function () {
            this.initMemberMaps();
            return this.actionMemberMap;
        };

        DomainObjectRepresentation.prototype.member = function (id) {
            return this.members()[id];
        };

        DomainObjectRepresentation.prototype.propertyMember = function (id) {
            return this.propertyMembers()[id];
        };

        DomainObjectRepresentation.prototype.collectionMember = function (id) {
            return this.collectionMembers()[id];
        };

        DomainObjectRepresentation.prototype.actionMember = function (id) {
            return this.actionMembers()[id];
        };

        DomainObjectRepresentation.prototype.updateLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/update");
        };

        DomainObjectRepresentation.prototype.persistLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/persist");
        };

        DomainObjectRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        DomainObjectRepresentation.prototype.updateMap = function () {
            return this.updateLink().arguments();
        };

        DomainObjectRepresentation.prototype.persistMap = function () {
            return this.persistLink().arguments();
        };

        DomainObjectRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        DomainObjectRepresentation.prototype.getPersistMap = function () {
            return new PersistMap(this, this.persistMap());
        };

        DomainObjectRepresentation.prototype.getUpdateMap = function () {
            return new UpdateMap(this, this.updateMap());
        };

        DomainObjectRepresentation.prototype.setFromUpdateMap = function (map) {
            for (var member in this.members()) {
                var m = this.members()[member];
                m.update(map.attributes["members"][member]);
            }

            this.set(map.attributes);
        };

        DomainObjectRepresentation.prototype.setFromPersistMap = function (map) {
            this.set(map.attributes);
            this.resetMemberMaps();
        };

        DomainObjectRepresentation.prototype.preFetch = function () {
            this.memberMap = null;
        };
        return DomainObjectRepresentation;
    })(ResourceRepresentation);
    Spiro.DomainObjectRepresentation = DomainObjectRepresentation;

    var ScalarValueRepresentation = (function (_super) {
        __extends(ScalarValueRepresentation, _super);
        function ScalarValueRepresentation(wrapped) {
            _super.call(this, wrapped);
        }
        ScalarValueRepresentation.prototype.value = function () {
            return new Value(this.wrapped.value);
        };
        return ScalarValueRepresentation;
    })(NestedRepresentation);
    Spiro.ScalarValueRepresentation = ScalarValueRepresentation;

    var ListRepresentation = (function (_super) {
        __extends(ListRepresentation, _super);
        function ListRepresentation(object) {
            _super.call(this, object);
        }
        ListRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        ListRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        ListRepresentation.prototype.value = function () {
            return Links.WrapLinks(this.get("value"));
        };
        return ListRepresentation;
    })(ResourceRepresentation);
    Spiro.ListRepresentation = ListRepresentation;

    var ErrorRepresentation = (function (_super) {
        __extends(ErrorRepresentation, _super);
        function ErrorRepresentation(object) {
            _super.call(this, object);
        }
        ErrorRepresentation.prototype.message = function () {
            return this.get("message");
        };

        ErrorRepresentation.prototype.stacktrace = function () {
            return this.get("stacktrace");
        };

        ErrorRepresentation.prototype.causedBy = function () {
            var cb = this.get("causedBy");
            return cb ? new ErrorRepresentation(cb) : null;
        };
        return ErrorRepresentation;
    })(ResourceRepresentation);
    Spiro.ErrorRepresentation = ErrorRepresentation;

    var PersistMap = (function (_super) {
        __extends(PersistMap, _super);
        function PersistMap(domainObject, map) {
            _super.call(this, map, domainObject, domainObject.instanceId());
            this.domainObject = domainObject;
            domainObject.persistLink().copyToHateoasModel(this);
        }
        PersistMap.prototype.onChange = function () {
            this.domainObject.setFromPersistMap(this);
        };

        PersistMap.prototype.onError = function (map, statusCode, warnings) {
            return new ErrorMap(map, statusCode, warnings);
        };

        PersistMap.prototype.setMember = function (name, value) {
            value.set(this.attributes["members"], name);
        };
        return PersistMap;
    })(Spiro.ArgumentMap);
    Spiro.PersistMap = PersistMap;

    var VersionRepresentation = (function (_super) {
        __extends(VersionRepresentation, _super);
        function VersionRepresentation() {
            _super.call(this);
        }
        VersionRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        VersionRepresentation.prototype.upLink = function () {
            return this.links().linkByRel("up");
        };

        VersionRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        VersionRepresentation.prototype.getUp = function () {
            return this.upLink().getTarget();
        };

        VersionRepresentation.prototype.specVersion = function () {
            return this.get("specVersion");
        };

        VersionRepresentation.prototype.implVersion = function () {
            return this.get("implVersion");
        };

        VersionRepresentation.prototype.optionalCapabilities = function () {
            return this.get("optionalCapabilities");
        };
        return VersionRepresentation;
    })(ResourceRepresentation);
    Spiro.VersionRepresentation = VersionRepresentation;

    var DomainServicesRepresentation = (function (_super) {
        __extends(DomainServicesRepresentation, _super);
        function DomainServicesRepresentation() {
            _super.apply(this, arguments);
        }
        DomainServicesRepresentation.prototype.upLink = function () {
            return this.links().linkByRel("up");
        };

        DomainServicesRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        DomainServicesRepresentation.prototype.getUp = function () {
            return this.upLink().getTarget();
        };
        return DomainServicesRepresentation;
    })(ListRepresentation);
    Spiro.DomainServicesRepresentation = DomainServicesRepresentation;

    var UserRepresentation = (function (_super) {
        __extends(UserRepresentation, _super);
        function UserRepresentation() {
            _super.apply(this, arguments);
        }
        UserRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        UserRepresentation.prototype.upLink = function () {
            return this.links().linkByRel("up");
        };

        UserRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        UserRepresentation.prototype.getUp = function () {
            return this.upLink().getTarget();
        };

        UserRepresentation.prototype.userName = function () {
            return this.get("userName");
        };
        UserRepresentation.prototype.friendlyName = function () {
            return this.get("friendlyName");
        };
        UserRepresentation.prototype.email = function () {
            return this.get("email");
        };
        UserRepresentation.prototype.roles = function () {
            return this.get("roles");
        };
        return UserRepresentation;
    })(ResourceRepresentation);
    Spiro.UserRepresentation = UserRepresentation;

    var HomePageRepresentation = (function (_super) {
        __extends(HomePageRepresentation, _super);
        function HomePageRepresentation() {
            _super.call(this);
            this.hateoasUrl = appPath;
        }
        HomePageRepresentation.prototype.serviceLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/services");
        };

        HomePageRepresentation.prototype.userLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/user");
        };

        HomePageRepresentation.prototype.selfLink = function () {
            return this.links().linkByRel("self");
        };

        HomePageRepresentation.prototype.versionLink = function () {
            return this.links().linkByRel("urn:org.restfulobjects:rels/version");
        };

        HomePageRepresentation.prototype.getSelf = function () {
            return this.selfLink().getTarget();
        };

        HomePageRepresentation.prototype.getUser = function () {
            return this.userLink().getTarget();
        };

        HomePageRepresentation.prototype.getDomainServices = function () {
            var domainServices = new DomainServicesRepresentation();
            this.serviceLink().copyToHateoasModel(domainServices);
            return domainServices;
        };

        HomePageRepresentation.prototype.getVersion = function () {
            return this.versionLink().getTarget();
        };
        return HomePageRepresentation;
    })(ResourceRepresentation);
    Spiro.HomePageRepresentation = HomePageRepresentation;

    var Link = (function (_super) {
        __extends(Link, _super);
        function Link(object) {
            _super.call(this, object);
            this.repTypeToModel = {
                "homepage": HomePageRepresentation,
                "user": UserRepresentation,
                "version": VersionRepresentation,
                "list": ListRepresentation,
                "object": DomainObjectRepresentation,
                "object-property": PropertyRepresentation,
                "object-collection": CollectionRepresentation,
                "object-action": ActionRepresentation,
                "action-result": ActionResultRepresentation,
                "error": ErrorRepresentation
            };
        }
        Link.prototype.href = function () {
            return this.get("href");
        };

        Link.prototype.method = function () {
            return this.get("method");
        };

        Link.prototype.rel = function () {
            return new Rel(this.get("rel"));
        };

        Link.prototype.type = function () {
            return new MediaType(this.get("type"));
        };

        Link.prototype.title = function () {
            return this.get("title");
        };

        Link.prototype.arguments = function () {
            return this.get("arguments");
        };

        Link.prototype.copyToHateoasModel = function (hateoasModel) {
            hateoasModel.hateoasUrl = this.href();
            hateoasModel.method = this.method();
        };

        Link.prototype.getHateoasTarget = function (targetType) {
            var matchingType = this.repTypeToModel[targetType];
            var target = new matchingType();
            return target;
        };

        Link.prototype.getTarget = function () {
            var target = this.getHateoasTarget(this.type().representationType);
            this.copyToHateoasModel(target);
            return target;
        };
        return Link;
    })(Spiro.ModelShim);
    Spiro.Link = Link;
})(Spiro || (Spiro = {}));
//@ sourceMappingURL=spiro.models.js.map
